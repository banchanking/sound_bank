package com.boot.sound.fund.dto;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

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
    private Integer fund_account_id;

    @Column(name = "CUSTOMER_ID", nullable = false)
    private String customer_id;

    @Column(name = "FUND_ACCOUNT_PASSWORD", nullable = false)
    private String fund_account_password;

    @Column(name = "FUND_ACCOUNT_NUMBER", nullable = false, unique = true)
    private String fund_account_number;

    @Column(name = "FUND_BALANCE", precision = 15, scale = 2)
    private BigDecimal fund_balance = BigDecimal.ZERO;

    @Column(name = "FUND_OPEN_DATE")
    private LocalDate fund_open_date;

    @Column(name = "LINKED_ACCOUNT_NUMBER")
    private String linked_account_number;

    @Column(name = "STATUS", length = 20)
    private String status = "PENDING";

    @Column(name = "CLOSE_DATE")
    private LocalDate close_date;

    @Column(name = "FUND_ACCOUNT_NAME", length = 50)
    private String fund_account_name;
}

