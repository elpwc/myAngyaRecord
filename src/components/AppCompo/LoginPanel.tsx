import { Link } from 'react-router';

export const LoginPanel = ({ direction = 'row' }: { direction?: 'column' | 'row' }) => {
  return (
    <div className="loginPanel">
      <p style={{ width: '100%', textAlign: 'center', padding: direction === 'row' ? '20px 0' : '20px 0' }}>ログインしてから記録してください</p>
      <div className="loginPanel-linklist" style={{ flexDirection: direction }}>
        <Link className="loginPanel-link" to="/emailverify">
          新規アカウント
        </Link>
        <Link className="loginPanel-link" to="/login">
          ログイン
        </Link>
      </div>
    </div>
  );
};
