import React from 'react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { isLogin, logout } from '../../utils/userUtils';
import { c_userName } from '../../utils/cookies';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;

  const menuItems = [
    { title: '日本', link: '/japan', disabled: false },
    { title: '中国本土', link: '/mainlandchina', disabled: true },
    { title: '台湾', link: '/taiwan', disabled: true },
    { title: '韓国', link: '/taiwan' , disabled: true},
    { title: '沼津', link: '/numazu', disabled: false },
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
              <div key={menuItem.title} className={`regionMenuItem ${menuItem.disabled ? 'regionMenuItem-disabled ' : ''}  ${mylocation.pathname.includes(menuItem.link) ? 'selected' : ''}`}>
                <Link className={`regionMenuLink ${menuItem.disabled ? 'regionMenuLink-disabled ' : ''}`} to={menuItem.link}>{menuItem.title}</Link>
              </div>
            ))}
          </menu>

          <div className="rightMenu">
            {isLogin() ? (
              <>
                <Link to="/user">{c_userName()}</Link>
                <button
                  onClick={() => {
                    logout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/emailverify">Register</Link>
                <Link to="/login">Login</Link>
              </>
            )}
            <Link to="/about">About</Link>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};
