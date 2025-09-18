import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { getMapTitleByMapsId, MapsId } from '../../utils/map';
import { getRanking } from '../../utils/serverUtils';
import { Ranking } from '../../utils/types';
import Pagination from '../../components/Pagination';
import { useIsMobile } from '../../utils/hooks';
import Avatar from '../../components/Avatar';

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
  const [total, setTotal] = useState(0);
  // 页数
  const [currentPage, setcurrentPage] = useState(1);

  const refreshRanking = (page: number) => {
    getRanking(
      props.mapId,
      page,
      AMOUNT_PER_PAGE,
      res => {
        setRanking(res.ranking);
        setTotal(res.total);
      },
      () => {}
    );
  };

  useEffect(() => {
    // document.title = '';
    refreshRanking(currentPage);
  }, [props.mapId]);

  const handlePageChange = (page: number) => {
    refreshRanking(page);
    setcurrentPage(page);
  };

  return (
    <div className="rankingListContainer">
      <h3>{getMapTitleByMapsId(props.mapId)}行脚ランキング</h3>
      <Pagination currentPage={currentPage} totalItems={total} itemsPerPage={AMOUNT_PER_PAGE} onPageChange={handlePageChange} />

      <ul className="RankingList" style={{ width: isMobile ? '95%' : '60%' }}>
        {ranking.map(rank => {
          return (
            <li className="RankingListItem">
              <span className="rankPosition">第{rank.ranking}位</span>
              <div className="rankInfo">
                <div className="rankInfoTop">
                  <Link to={'/user/' + rank.uid} className="rankUserName">
                    <Avatar avatarUrl={rank.avatar_url} width={24} />
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
    </div>
  );
};
