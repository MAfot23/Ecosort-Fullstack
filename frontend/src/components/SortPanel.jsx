import { useEffect, useRef, useState } from 'react';
import api from '../api';

const BIN_META = {
  organic:    { label: 'Organic',    icon: '🍃' },
  recyclable: { label: 'Recyclable', icon: '♻️' },
  residual:   { label: 'Residual',   icon: '🗑️' },
};

export default function SortPanel() {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const timerRef      = useRef(null);

  const [model,       setModel]       = useState(null);
  const [modelFailed, setModelFailed] = useState(false);
  const [streamOn,    setStreamOn]    = useState(false);
  const [status,      setStatus]      = useState('Detection model: loading…');
  const [result,      setResult]      = useState(null); // { name, icon, bin, tip, confText }
  const [items,       setItems]       = useState([]);
  const [scanCount,   setScanCount]   = useState(null); // global counter

  // ── 3-2-1 Countdown & Static Freeze States ──────────────────────────────────
  const [countdown,   setCountdown]   = useState(null); // null, 3, 2, 1
  const [isFrozen,    setIsFrozen]    = useState(false);
  const [frozenImage, setFrozenImage] = useState(null);
  const [flash,       setFlash]       = useState(false);
  const [scanning,    setScanning]    = useState(false);

  // ── Weekly Disposal Tracker ("Ilang beses nagtapon") ────────────────────────
  const [weeklyData,  setWeeklyData]  = useState(null);

  // Load items, global scan count, and weekly stats from Laravel API
  useEffect(() => {
    api.get('/waste-items').then((res) => setItems(res.data)).catch(() => {});
    fetchCountsAndWeekly();
  }, []);

  function fetchCountsAndWeekly() {
    api.get('/detect/count').then((res) => setScanCount(res.data.scan_count)).catch(() => {});
    api.get('/scans/weekly').then((res) => setWeeklyData(res.data)).catch(() => {});
  }

  // Load TF.js model with WebGL GPU acceleration
  useEffect(() => {
    if (typeof window.cocoSsd === 'undefined') {
      setModelFailed(true);
      setStatus("Live detection isn't available in this environment — use the tap list to sort items instead.");
      return;
    }

    async function initModel() {
      try {
        if (window.tf) {
          await window.tf.setBackend('webgl').catch(() => window.tf.setBackend('cpu'));
          await window.tf.ready();
        }
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function showManualResult(item) {
    setResult({ name: item.name, icon: item.icon, bin: item.bin, tip: item.tip, confText: 'Selected manually' });
    try {
      const res = await api.post('/detect/manual', { waste_item_id: item.id });
      if (res.data.scan_count != null) setScanCount(res.data.scan_count);
      fetchCountsAndWeekly();
    } catch {
      // non-fatal
    }
  }

  async function turnOnCamera() {
    if (streamOn) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      videoRef.current.srcObject = stream;
      setStreamOn(true);
      setIsFrozen(false);
      setFrozenImage(null);
      if (!modelFailed) {
        setStatus(model ? 'Model ready — point at an item and tap "Scan item".' : 'Detection model: loading…');
      }
    } catch {
      setStatus('Camera access was blocked or unavailable — use the tap list instead.');
    }
  }

  // ── Start 3-2-1 Countdown before capturing ─────────────────────────────────
  function startScanWithCountdown() {
    if (!model || !streamOn || scanning || countdown !== null) return;

    // Reset previous results and start 3-2-1 sequence
    setResult(null);
    let count = 3;
    setCountdown(3);
    setStatus('Hold item steady... 3');

    timerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        setStatus(`Hold item steady... ${count}`);
      } else {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(null);
        captureAndDetect();
      }
    }, 850);
  }

  function cancelCountdown() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    setStatus('Scan canceled. Tap "Scan item" when ready.');
  }

  // ── Snap Static Freeze Frame & Run AI Detection ────────────────────────────
  async function captureAndDetect() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // 1. Shutter flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 220);

    // 2. Capture static snapshot onto canvas
    const targetW = 400;
    const targetH = 300;
    canvas.width  = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    ctx.drawImage(video, 0, 0, targetW, targetH);

    // 3. Freeze the view by saving the static image data URL
    const snapshotUrl = canvas.toDataURL('image/jpeg', 0.90);
    setFrozenImage(snapshotUrl);
    setIsFrozen(true);

    // 4. Run AI detection on the static snapshot
    setScanning(true);
    setStatus('📸 Photo captured! Analyzing static image…');

    try {
      const preds = await model.detect(canvas, 3, 0.30);
      if (!preds || !preds.length) {
        setStatus('Nothing recognizable in the photo — try scanning closer or from another angle.');
        setScanning(false);
        return;
      }

      preds.sort((a, b) => b.score - a.score);
      const top = preds[0];

      // Server lookup
      const res = await api.post('/detect', {
        coco_class: top.class,
        confidence: top.score,
        method: 'camera',
      });

      if (res.data.scan_count != null) setScanCount(res.data.scan_count);
      fetchCountsAndWeekly();

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
      setStatus('Item identified! Tap "Scan another item" to unfreeze camera.');
    } catch {
      setStatus('Scan analysis failed — try again or use the tap list.');
    } finally {
      setScanning(false);
    }
  }

  // ── Unfreeze camera and return to live feed ────────────────────────────────
  function unfreezeAndRescan() {
    setIsFrozen(false);
    setFrozenImage(null);
    setResult(null);
    setStatus('Camera live — point at an item and tap "Scan item".');
  }

  // Calculate highest count for bar chart scaling
  const maxDailyCount = weeklyData?.daily
    ? Math.max(1, ...weeklyData.daily.map((d) => d.count))
    : 1;

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

        {/* ── Camera Viewfinder with 3-2-1 Countdown & Static Freeze Frame ── */}
        <div className="cam-frame">
          {/* Shutter Flash Animation */}
          {flash && <div className="cam-flash-overlay" />}

          {/* Static Freeze Frame (shown after capture) */}
          {isFrozen && frozenImage ? (
            <>
              <img src={frozenImage} alt="Static Capture" className="cam-frozen-img" />
              <div className="cam-frozen-badge">📸 Static Capture</div>
            </>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ display: streamOn ? 'block' : 'none' }}
            />
          )}

          {/* 3-2-1 Countdown Overlay */}
          {countdown !== null && (
            <div className="cam-countdown-overlay">
              <div className="countdown-circle">
                <span className="countdown-num">{countdown}</span>
              </div>
              <div className="countdown-text">Hold item steady…</div>
              <button
                type="button"
                className="btn btn-link"
                style={{ color: '#fff', marginTop: 10, fontSize: '0.82rem' }}
                onClick={cancelCountdown}
              >
                Cancel
              </button>
            </div>
          )}

          {!streamOn && !isFrozen && (
            <div className="cam-placeholder">
              Camera is off.<br />Turn it on, then point it at an item.
            </div>
          )}
        </div>

        {/* Hidden Canvas for Image Processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* ── Camera Controls ── */}
        <div className="cam-controls">
          {!streamOn ? (
            <button className="btn btn-primary" onClick={turnOnCamera}>
              Turn on camera
            </button>
          ) : isFrozen ? (
            <button className="btn btn-primary" onClick={unfreezeAndRescan}>
              🔄 Scan another item
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={startScanWithCountdown}
              disabled={!model || scanning || countdown !== null}
            >
              {countdown !== null
                ? `Capturing in ${countdown}…`
                : scanning
                ? '⚡ Analyzing…'
                : '📸 Scan item (3-2-1)'}
            </button>
          )}

          {streamOn && !isFrozen && (
            <button
              className="btn"
              onClick={captureAndDetect}
              disabled={!model || scanning || countdown !== null}
              title="Skip countdown and snap immediately"
            >
              Instant Snap
            </button>
          )}
        </div>

        <div className="status-line">{status}</div>

        {/* ── Result Card ── */}
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

        {/* ── Weekly Disposal Tracker ("Ilang beses nagtapon") ── */}
        {weeklyData && (
          <div className="card weekly-card">
            <div className="weekly-head">
              <div>
                <h3 className="section-title">📅 Weekly Disposal Tracker</h3>
                <p className="helper">Ilang beses nagtapon ngayong linggo</p>
              </div>
              <div className="weekly-total-badge">
                <span className="weekly-num">{weeklyData.this_week_total}</span>
                <span className="weekly-sub">disposals this week</span>
              </div>
            </div>

            {/* 7-Day Mini Bar Chart */}
            <div className="weekly-bar-chart">
              {weeklyData.daily?.map((d) => {
                const fillPercent = d.count > 0 ? Math.max(15, (d.count / maxDailyCount) * 100) : 0;
                return (
                  <div key={d.day} className={`day-col ${d.is_today ? 'today' : ''}`} title={`${d.date}: ${d.count} disposals`}>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${fillPercent}%` }} />
                    </div>
                    <span className="day-count">{d.count}</span>
                    <span className="day-label">{d.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Weekly Bin Breakdown */}
            <div className="weekly-bin-chips">
              <span className="bin-pill organic">🍃 {weeklyData.by_bin_this_week?.organic || 0} Organic</span>
              <span className="bin-pill recyclable">♻️ {weeklyData.by_bin_this_week?.recyclable || 0} Recyclable</span>
              <span className="bin-pill residual">🗑️ {weeklyData.by_bin_this_week?.residual || 0} Residual</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Column: Info & Tap List ── */}
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
