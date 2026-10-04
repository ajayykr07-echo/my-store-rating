
const fs = require('fs');

const css = \
/* UserView Redesign Classes */
.search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--card-bg);
  padding: 32px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  margin-bottom: 32px;
}
@media (min-width: 768px) {
  .search-container {
    flex-direction: row;
    align-items: flex-end;
  }
}
.search-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.search-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-main);
  color: var(--text-main);
  font-size: 15px;
  transition: all 0.2s ease;
}
.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}
.search-btn {
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.search-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
.reset-btn {
  padding: 12px 24px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.reset-btn:hover {
  background: var(--bg-main);
  color: var(--text-main);
}
.store-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .store-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}
.store-card {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
  border-color: var(--primary);
}
.store-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}
.store-address {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}
.rating-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--bg-main);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 20px;
}
.action-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn.submit {
  background: var(--primary);
  color: white;
}
.action-btn.submit:hover:not(:disabled) {
  background: var(--primary-hover);
}
.action-btn.update {
  background: var(--sky-600);
  color: white;
}
.action-btn.update:hover:not(:disabled) {
  background: var(--sky-700);
}
.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
\;
fs.appendFileSync('frontend/src/index.css', '\n' + css);

