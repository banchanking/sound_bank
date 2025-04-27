import React, { useEffect, useState } from "react";
import "../Css/admin/AdminList.css";
import AdminAxios from "../jwt/AdminAxios";

const AdminList = ({ setSelectedComponent, setSelectedAdmin }) => {
  const [adminList, setAdminList] = useState([]);

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchAdminList = () => {
    AdminAxios.get("/list")
      .then((res) => {
        setAdminList(res.data);
      })
      .catch((err) => {
        console.error("관리자 목록 조회 실패:", err);
        alert("관리자 목록을 불러오는 데 실패했습니다.");
      });
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin); // ✅ 수정할 관리자를 선택하고
    setSelectedComponent("AdminEdit"); // ✅ AdminEdit으로 이동
  };

  const handleDelete = (admin) => {
    const customerId = admin.customerId;
    const loginId = localStorage.getItem("customerId");
    if (window.confirm(`'${admin.customerId}' 관리자를 삭제하시겠습니까?`)) {
      if (customerId === loginId) {
        alert("접속중인 아이디를 삭제 할 수 없습니다.");
        return;
      }
      AdminAxios.post("/delete", {
        customerId,
      })
        .then((res) => {
          alert(res.data);
          fetchAdminList(); // ✅ 삭제 후 목록 새로고침
        })
        .catch((error) => {
          console.error(error);

          if (error.response) {
            alert(error.response.data || "요청 실패");
          } else if (error.request) {
            alert("서버로부터 응답이 없습니다.");
          } else {
            alert("요청 설정 중 오류 발생");
          }
        });
    }
  };

  return (
    <div className="adminList-container">
      <h2 className="adminList-title">👑 관리자 목록</h2>
      <table className="adminList-table">
        <thead>
          <tr>
            <th>No</th>
            <th>아이디</th>
            <th>이름</th>
            <th>등록일자</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {adminList.length > 0 ? (
            adminList.map((admin, index) => (
              <tr key={admin.customerId}>
                <td>{index + 1}</td>
                <td>{admin.customerId}</td>
                <td>{admin.name}</td>
                <td>
                  {new Date(admin.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="adminList-manage-buttons">
                  <button onClick={() => handleEdit(admin)}>수정</button>
                  <button onClick={() => handleDelete(admin)}>삭제</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="adminList-empty">
                등록된 관리자가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminList;
