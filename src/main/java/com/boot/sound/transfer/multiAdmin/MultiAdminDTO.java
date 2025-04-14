package com.boot.sound.transfer.multiAdmin;

import java.math.BigDecimal;
import java.sql.Timestamp;
import lombok.Data;

@Data
public class MultiAdminDTO {
    private int transfer_id;
    private String customer_id;
    private String out_account_number;
    private BigDecimal amount;
    private String in_account_number;
    private String in_name;
    private String memo;
    private String status;
    private String reject_reason;
    private Timestamp request_date;
    private Timestamp approval_date;
}
