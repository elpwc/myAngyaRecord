import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { MapsId } from '../../utils/map';
import { getRanking } from '../../utils/serverUtils';
import { Ranking } from '../../utils/types';
import Pagination from '../../components/Pagination';
import { useIsMobile } from '../../utils/hooks';

interface P {
  mapId: MapsId;
}

const AMOUNT_PER_PAGE = 20;

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

  // let currentId: string = params.id as string;

  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [currentPage, setcurrentPage] = useState(1);

  const refreshRanking = (page: number) => {
    getRanking(
      props.mapId,
      page,
      AMOUNT_PER_PAGE,
      res => {
        setRanking(res);
      },
      () => {}
    );
  };

  useEffect(() => {
    // document.title = '';
    refreshRanking(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    refreshRanking(page);
    setcurrentPage(page);
  };

  return (
    <div className="rankingListContainer">
      <ul className="RankingList" style={{ width: isMobile ? '95%' : '60%' }}>
        {ranking.map(rank => {
          return (
            <li className="RankingListItem">
              <span className="rankPosition">第{rank.ranking}位</span>
              <div className="rankInfo">
                <div className="rankInfoTop">
                  <Link to={'/user/' + rank.uid} className="rankUserName">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                    <span className="">{rank.username}</span>
                  </Link>
                  <span className="">{rank.name}</span>
                </div>
                <span className="rankDesc">{rank.desc}</span>
              </div>
              <span className="rankScore">行脚値：{rank.score}</span>
              <button className="rankButton">閲覧</button>
            </li>
          );
        })}
      </ul>

      <Pagination currentPage={currentPage} totalItems={100} itemsPerPage={AMOUNT_PER_PAGE} onPageChange={handlePageChange} />
    </div>
  );
};
