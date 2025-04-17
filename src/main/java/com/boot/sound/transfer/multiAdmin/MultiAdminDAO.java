package com.boot.sound.transfer.multiAdmin;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Mapper
public interface MultiAdminDAO {
    List<MultiAdminDTO> getApproveList();
    List<MultiAdminDTO> getTransferDetails(int transfer_id);
    void updateApprovalStatusByGroup(@Param("status") String status,
                                     @Param("reason") String reason,
                                     @Param("customer_id") String customer_id,
                                     @Param("request_date") Timestamp request_date);
    void updateTransferDateNow(@Param("customer_id") String customer_id,
                               @Param("request_date") Timestamp request_date);
    List<MultiAdminDTO> findTransfersByGroup(@Param("customer_id") String customer_id,
                                             @Param("request_date") Timestamp request_date);
    void decreaseBalance(@Param("acc") String acc, @Param("amt") BigDecimal amt);
    void increaseBalance(@Param("acc") String acc, @Param("amt") BigDecimal amt);

    void insertTransaction(
    	    @Param("account_number") String account_number,
    	    @Param("transaction_type") String transaction_type,
    	    @Param("amount") BigDecimal amount,
    	    @Param("comment") String comment,
    	    @Param("customer_name") String customer_name,
    	    @Param("account_type") String account_type
    	);
}