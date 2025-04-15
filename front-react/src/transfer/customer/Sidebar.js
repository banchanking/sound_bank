// Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Css/transfer/Sidebar.css'; 
function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>이체 메뉴</h2>
      <ul>
        {/* 실시간 이체 */}
        <li style={{ fontWeight: 'bold'}} onClick={() => navigate('/TransInstant')}>실시간 이체</li>

        {/* 자동이체 대메뉴 */}
        <li>
          <div className="submenu-title">자동이체</div>
          <ul className="submenu">
            <li onClick={() => navigate('/TransAuto')}>자동이체 등록</li>
            <li onClick={() => navigate('/TransAutoEdit')}>자동이체 관리</li>
          </ul>
        </li>

        {/* 다건이체 */}
        <li>
          <div className="submenu-title">다건이체</div>
          <ul className="submenu">
            <li onClick={() => navigate('/TransMulti')}>다건이체 등록</li>
            <li onClick={() => navigate('/TransMultiEdit')}>다건이체 관리</li>
          </ul>
        </li>

        {/* 이체한도 변경 */}
        <li>
          <div className="submenu-title">이체한도</div>
          <ul className="submenu">
            <li onClick={() => navigate('/TransLimit')}>이체한도 변경신청</li>
            <li onClick={() => navigate('/TransLimitEdit')}>신청내역 관리</li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
