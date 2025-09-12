import React from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;

  useEffect(() => {
    document.title = 'OtogeMap - 404';
  }, []);

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          404
          <br />
          訪問しようとしているURLはこのサイトに存在しません
          <br />
          もしくはサイト管理者に削除されました
          <br />
          <br />
          <Link to="/" style={{ color: '#007bff' }}>
            トップページへ
          </Link>
        </div>
      </div>
    </>
  );
};
