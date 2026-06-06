import { Icon } from "../shared/Icon";

export function Header() {
  return (
    <header className="dashboard-header">
      <a className="brand-lockup" href="/" aria-label="四川大学">
        <img src="/assets/sichuan-university-brand.png" alt="" />
        <span>
          <strong>四川大学</strong>
          <small>SICHUAN UNIVERSITY</small>
        </span>
      </a>

      <div className="title-lockup">
        <span className="title-wing title-wing--left" aria-hidden="true" />
        <h1>智 慧 农 业 灌 溉 平 台</h1>
        <span className="title-wing title-wing--right" aria-hidden="true" />
        <button className="base-selector" type="button">
          位山示范基地 A 区 · 数字孪生
          <Icon name="chevron" />
        </button>
      </div>

      <div className="header-actions" aria-label="系统快捷信息">
        <div className="weather-status">
          <span className="sun-cloud" aria-hidden="true" />
          <span>26°C</span>
          <span>晴</span>
          <span>10:00:09</span>
        </div>
        <button className="round-action" type="button" aria-label="用户中心">
          <Icon name="user" />
        </button>
        <button className="round-action round-action--plain" type="button" aria-label="系统设置">
          <Icon name="settings" />
        </button>
        <button className="weather-button" type="button">
          <Icon name="cloud" />
          查看天气
        </button>
      </div>
    </header>
  );
}
