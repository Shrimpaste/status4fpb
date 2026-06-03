import './App.css'

const statusPresets = [
  {
    label: '套卷中',
    place: '自习桌',
    note: '桌面堆满真题，进度条正在慢慢爬。',
    className: 'desk',
  },
  {
    label: '缩圈中',
    place: '缩圈法阵',
    note: '复习范围正在被压成更小的一圈。',
    className: 'circle',
  },
]

function App() {
  return (
    <main className="app-shell">
      <section className="intro-panel">
        <p className="eyebrow">Local-first QQ group mood board</p>
        <h1>QQ群友状态家园</h1>
        <p className="lede">
          先用手动状态和虚拟头像搭起一个安全的像素小镇，再逐步扩展状态逻辑和授权数据源。
        </p>
        <div className="action-row">
          <button
            type="button"
            className="primary-action"
            disabled
            title="成员管理将在下一轮实现"
          >
            添加群友
          </button>
          <span className="privacy-note">MVP 不接入 QQ 私有接口</span>
        </div>
      </section>

      <section className="pixel-home" aria-label="像素家园预览">
        <div className="map-grid" aria-hidden="true">
          <div className="room room-study">
            <span className="sprite sprite-a"></span>
            <span className="bubble">套卷中</span>
          </div>
          <div className="room room-circle">
            <span className="magic-ring"></span>
            <span className="sprite sprite-b"></span>
            <span className="bubble">缩圈中</span>
          </div>
          <div className="room room-garden">
            <span className="pixel-tree"></span>
          </div>
          <div className="room room-mist">
            <span className="question-tile">?</span>
          </div>
        </div>
      </section>

      <section className="status-dock" aria-label="核心状态">
        {statusPresets.map((status) => (
          <article className={`status-card ${status.className}`} key={status.label}>
            <p className="status-place">{status.place}</p>
            <h2>{status.label}</h2>
            <p>{status.note}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
