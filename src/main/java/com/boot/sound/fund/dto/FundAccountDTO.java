package com.boot.sound.fund.dto;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fund_account_tbl")
public class FundAccountDTO {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FUND_ACCOUNT_ID", nullable = false, updatable = false)
    private Integer fundAccountId;

    @Column(name = "CUSTOMER_ID", nullable = false)
    private String customerId;

    @Column(name = "FUND_ACCOUNT_PASSWORD", nullable = false)
    private String fundAccountPassword;

    @Column(name = "FUND_ACCOUNT_NUMBER", nullable = false, unique = true)
    private String fundAccountNumber;

    @Column(name = "FUND_ACCOUNT_NAME", length = 50)
    private String fundAccountName;
    
    @Column(name = "FUND_BALANCE", precision = 15, scale = 2)
    private BigDecimal fundBalance = BigDecimal.ZERO;

    @Column(name = "FUND_OPEN_DATE")
    private LocalDate fundOpenDate;

    @Column(name = "LINKED_ACCOUNT_NUMBER")
    private String linkedAccountNumber;

    @Column(name = "STATUS", length = 20)
    private String status = "PENDING";

    @Column(name = "CLOSE_DATE")
    private LocalDateTime closeDate;

}

