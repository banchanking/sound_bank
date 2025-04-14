package com.boot.sound.transfer.multiAdmin;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class MultiAdminRejectRequest {
    private String customer_id;
    private Timestamp request_date;
    private String reason;
}
