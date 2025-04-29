import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAutoManagement.css';

const DepositAutoManagement = () => {
  const navigate = useNavigate();
  const [autoTransfers, setAutoTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const customerId = getCustomerID();

  useEffect(() => {
    if (!customerId) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?");
      if (goLogin) navigate("/login");
      else navigate("/");
      return;
    }
    fetchAutoTransfers();
  }, [customerId, navigate]);

  const fetchAutoTransfers = async () => {
    try {
      const response = await RefreshToken.get(`/deposit/auto-transfer/customer/${customerId}`);
      setAutoTransfers(response.data);
    } catch (error) {
      console.error('자동이체 조회 에러:', error);
      message.error('자동이체 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '자동이체 해지',
      content: '정말로 이 자동이체를 해지하시겠습니까?',
      okText: '해지',
      cancelText: '취소',
      onOk: async () => {
        try {
          await RefreshToken.delete(`/deposit/auto-transfer/${id}`);
          message.success('자동이체가 해지되었습니다.');
          fetchAutoTransfers();
        } catch (error) {
          console.error('자동이체 해지 에러:', error);
          message.error('자동이체 해지에 실패했습니다.');
        }
      }
    });
  };

  const columns = [
    {
      title: '이체 계좌번호',
      dataIndex: 'targetAccountNumber',
      key: 'targetAccountNumber'
    },
    {
      title: '이체 금액',
      dataIndex: 'transferAmount',
      key: 'transferAmount',
      render: (amount) => `${amount?.toLocaleString()}원`
    },
    {
      title: '이체일',
      dataIndex: 'transferDay',
      key: 'transferDay',
      render: (day) => `매월 ${day}일`
    },
    {
      title: '상태',
      dataIndex: 'transferStatus',
      key: 'transferStatus',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '정상' : '중지'}
        </Tag>
      )
    },
    {
      title: '관리',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          해지
        </Button>
      )
    }
  ];

  return (
    <div className="depositContainer">
      <Card title="자동이체 관리">
        {autoTransfers.length === 0 ? (
          <div>현재 조회 가능한 계좌가 없습니다.</div>
        ) : (
          <Table
              columns={columns}
              dataSource={autoTransfers.filter(account => account.accountStatus === 'ACTIVE')}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: (total) => `총 ${total}건` }}
            />


        )}
      </Card>
    </div>
  );
  
};

export default DepositAutoManagement;
