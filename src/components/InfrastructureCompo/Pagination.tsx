import React from 'react';
import './Pagination.css';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={'paginationContainer'}>
      <button onClick={handlePrev} disabled={currentPage === 1} className={'pageButton'}>
        前へ
      </button>
      <span className={'pageInfo'}>
        第 {currentPage} / {totalPages} ページ
      </span>
      <button onClick={handleNext} disabled={currentPage === totalPages} className={'pageButton'}>
        次へ
      </button>
    </div>
  );
};

export default Pagination;
