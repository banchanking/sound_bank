package com.boot.sound.deposit.dao;

import java.math.BigDecimal;
import java.util.List;
import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DepositAutoTransferDAO {

    // 자동이체 등록
    int insertAutoTransfer(DepositAutoTransferDTO dto);

    // 자동이체 수정
    int updateAutoTransfer(@Param("autoTransferId") int autoTransferId,
                            @Param("amount") BigDecimal amount,
                            @Param("transferDay") int transferDay,
                            @Param("targetAccountNumber") String targetAccountNumber);

    // 자동이체 해지
    int deleteAutoTransfer(@Param("autoTransferId") int autoTransferId);

    // 고객별 자동이체 목록 조회
    List<DepositAutoTransferDTO> getAutoTransfersByCustomerId(@Param("customerId") String customerId);

    // 자동이체 대상 조회 (스케줄러용)
    List<DepositAutoTransferDTO> getTodayAutoTransfers(@Param("today") int today);

    // 자동이체 실행 (잔액 차감)
    int executeAutoTransfer(@Param("datId") int datId, @Param("amount") BigDecimal amount);
}
