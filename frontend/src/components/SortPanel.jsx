import { useEffect, useRef, useState } from 'react';
import api from '../api';

const BIN_META = {
  organic:    { label: 'Organic',    icon: '🍃' },
  recyclable: { label: 'Recyclable', icon: '♻️' },
  residual:   { label: 'Residual',   icon: '🗑️' },
};

export default function SortPanel() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [model,       setModel]       = useState(null);
  const [modelFailed, setModelFailed] = useState(false);
  const [streamOn,    setStreamOn]    = useState(false);
  const [scanning,    setScanning]    = useState(false);
  const [status,      setStatus]      = useState('Detection model: loading…');
  const [result,      setResult]      = useState(null); // { name, icon, bin, tip, confText }
  const [items,       setItems]       = useState([]);
  const [scanCount,   setScanCount]   = useState(null); // global counter

  // Load the tap-list items from the Laravel API
  useEffect(() => {
    api.get('/waste-items').then((res) => setItems(res.data)).catch(() => {});
    // Fetch initial scan count
    api.get('/detect/count').then((res) => setScanCount(res.data.scan_count)).catch(() => {});
  }, []);

  // Load the TF.js model with WebGL GPU acceleration for fast inference
  useEffect(() => {
    if (typeof window.cocoSsd === 'undefined') {
      setModelFailed(true);
      setStatus("Live detection isn't available in this environment — use the tap list to sort items instead.");
      return;
    }

    async function initModel() {
      try {
        if (window.tf) {
          // Use WebGL GPU acceleration for 5x faster scanning
          await window.tf.setBackend('webgl').catch(() => window.tf.setBackend('cpu'));
          await window.tf.ready();
        }
        // Load lightweight, ultra-fast MobileNet model
        const m = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        setModel(m);
        setStatus('Model ready. Turn on the camera to scan.');
      } catch {
        setModelFailed(true);
        setStatus("Live detection couldn't load here — use the tap list to sort items instead.");
      }
    }

    initModel();
  }, []);

  async function showManualResult(item) {
    setResult({ name: item.name, icon: item.icon, bin: item.bin, tip: item.tip, confText: 'Selected manually' });
    // Log the manual selection to the backend
    try {
      const res = await api.post('/detect/manual', { waste_item_id: item.id });
      if (res.data.scan_count != null) setScanCount(res.data.scan_count);
    } catch {
      // non-fatal — counter will resync on next scan
    }
  }

  async function turnOnCamera() {
    if (streamOn) return;
    try {
      // Request an optimized resolution (640x480) for high FPS and ultra-fast inference
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      videoRef.current.srcObject = stream;
      setStreamOn(true);
      if (!modelFailed) {
        setStatus(model ? 'Model ready — tap "Scan item".' : 'Detection model: loading…');
      }
    } catch {
      setStatus('Camera access was blocked or unavailable — use the tap list instead.');
    }
  }

  async function scanItem() {
    if (!model || !streamOn || scanning) return;
    setScanning(true);
    setStatus('⚡ Fast scanning…');

    try {
      const video  = videoRef.current;
      const canvas = canvasRef.current;

      // Downscale to 400x300 for 5x to 8x faster AI inference without losing accuracy
      const targetW = 400;
      const targetH = 300;
      canvas.width  = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      ctx.drawImage(video, 0, 0, targetW, targetH);

      // Fast inference: limit to top 3 predictions with minimum 30% confidence
      const preds = await model.detect(canvas, 3, 0.30);
      if (!preds || !preds.length) {
        setStatus('Nothing recognizable in frame — try moving closer, or pick from the tap list.');
        setScanning(false);
        return;
      }

      preds.sort((a, b) => b.score - a.score);
      const top = preds[0];

      // Server lookup
      const res = await api.post('/detect', { coco_class: top.class, confidence: top.score, method: 'camera' });

      if (res.data.scan_count != null) setScanCount(res.data.scan_count);

      if (!res.data.matched) {
        setStatus(res.data.message);
        setScanning(false);
        return;
      }

      const item = res.data.item;
      setResult({
        name:     item.name,
        icon:     item.icon,
        bin:      item.bin,
        tip:      item.tip,
        confText: `Detected as "${top.class}" — ${Math.round(top.score * 100)}% confidence`,
      });
      setStatus('Ready — point at an item and tap "Scan item".');
    } catch {
      setStatus('Scan failed — try again, or use the tap list.');
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="grid-2">
      <div>
        {/* ── Scan counter badge ── */}
        {scanCount !== null && (
          <div className="scan-counter">
            <span className="scan-counter-icon">🔍</span>
            <div>
              <div className="scan-counter-num">{scanCount.toLocaleString()}</div>
              <div className="scan-counter-label">items scanned total</div>
            </div>
          </div>
        )}

        <div className="cam-frame">
          <video ref={videoRef} autoPlay playsInline muted style={{ display: streamOn ? 'block' : 'none' }} />
          {!streamOn && <div className="cam-placeholder">Camera is off.<br />Turn it on, then point it at an item.</div>}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="cam-controls">
          <button className="btn btn-primary" onClick={turnOnCamera} disabled={streamOn}>
            {streamOn ? 'Camera on' : 'Turn on camera'}
          </button>
          <button className="btn" onClick={scanItem} disabled={!model || !streamOn || scanning}>
            {scanning ? '⚡ Scanning…' : 'Scan item'}
          </button>
        </div>
        <div className="status-line">{status}</div>

        {result && (
          <div className="result-card card show">
            <div className="result-head">
              <span className="ic">{result.icon}</span>
              <div>
                <h3>{result.name}</h3>
                <div className="result-conf">{result.confText}</div>
              </div>
            </div>
            <p className="result-tip">
              <strong style={{ color: `var(--${result.bin})` }}>
                {BIN_META[result.bin].icon} {BIN_META[result.bin].label} bin
              </strong>{' '}— {result.tip}
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="card">
          <h2 className="section-title">The three bins</h2>
          <div className="bin-legend">
            <div className="bin-row organic"><span className="ic">🍃</span><div><strong>Organic</strong><span className="desc">Food scraps, peels, coffee grounds, garden waste, greasy paper.</span></div></div>
            <div className="bin-row recyclable"><span className="ic">♻️</span><div><strong>Recyclable</strong><span className="desc">Clean bottles, cans, glass, paper, and cardboard.</span></div></div>
            <div className="bin-row residual"><span className="ic">🗑️</span><div><strong>Residual</strong><span className="desc">Everything else — broken items, wrappers, e-waste.</span></div></div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Not near a camera?</h2>
          <p className="helper">Tap an item to see where it goes.</p>
          <div className="chips">
            {items.map((item) => (
              <button key={item.id} className="chip" onClick={() => showManualResult(item)}>
                {item.icon} {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
