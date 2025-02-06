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
            <div className="regionMenuItem">
              <a href="/" onClick={() => {}}>
                日本
              </a>
            </div>
          </menu>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};
