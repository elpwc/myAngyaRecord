import React from 'react';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;

  const menuItems = [
    { title: '日本', link: '/japan' },
    { title: '中国本土', link: '/mainlandchina' },
    { title: '台湾', link: '/taiwan' },
    { title: '韓国', link: '/taiwan' },
    { title: '沼津', link: '/numazu' },
  ];

  useEffect(() => {
    // document.title = '';
  }, []);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
        }}
      >
        <header>
          <div id="title">My行脚記録</div>

          <menu id="regionMenu">
            {menuItems.map(menuItem => (
              <div 
                key={menuItem.title} 
                className={`regionMenuItem ${mylocation.pathname.includes(menuItem.link) ? 'selected' : ''}`}
              >
                <a href={menuItem.link}>{menuItem.title}</a>
              </div>
            ))}
          </menu>

          <div className="rightMenu">
            <a href="/register">Register</a>
            <a href="/login">Login</a>
            <a href="/about">About</a>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};
