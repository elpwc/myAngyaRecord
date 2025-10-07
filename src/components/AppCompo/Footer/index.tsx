import React from 'react';
import { useEffect } from 'react';
import './index.css';
import Coffee from '../../InfrastructureCompo/Coffee';
import OuterLink from '../../InfrastructureCompo/OuterLink';

interface P {}

export default (props: P) => {
  useEffect(() => {}, []);

  return (
    <footer className="page-footer">
      <div className="page-footer-about">
        <h2>About</h2>
        <p>
          My行脚記録を使用していただき、ありがとうございます
          <br />
          <br />
          開発者の
          <OuterLink link="https://x.com/elpwc" color="white">
            うに
          </OuterLink>
          です
          <br />
          <br />
          My行脚記録は訪れた場所を「<span style={{ color: '#ff8787ff' }}>色</span>」で記録できる地図サービスです
          <br />
          地図と旅行が好きで、このサイトを作りました
          <br />
          このサイトが、みんなの思い出の記録と次の冒険のきっかけになりますように
          <br />
          <br />
        </p>
        <p>もし気に入ったら、コーヒー１杯でご褒美してくれると大変喜びます</p>
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Coffee />
        </div>
      </div>
      <div className="page-footer-credit">
        <p>MIT License My行脚記録 © 2024 elpwc/wniko</p>
        <div className="flex">
          DataSource:
          <div className="flex-wrap">
            <OuterLink link="https://nlftp.mlit.go.jp/ksj/index.html" color="#b4b4b4ff">
              国土数値情報ダウンロードサイト
            </OuterLink>
            <OuterLink link="https://data.gov.hk/tc-data/dataset/hk-had-json1-hong-kong-administrative-boundaries/resource/30d55605-5be1-4038-8e92-3641f9b9448b" color="#b4b4b4ff">
              開放數據平台 DATA.GOV.HK
            </OuterLink>
            <OuterLink link="https://data.nat.gov.tw/dataset/7441" color="#b4b4b4ff">
              政府資料開放平臺 DATA.GOV.TW
            </OuterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
