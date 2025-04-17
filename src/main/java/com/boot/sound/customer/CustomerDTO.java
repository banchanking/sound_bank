package com.boot.sound.customer;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "CUSTOMER_TBL")
public class CustomerDTO {

    @Id
    @Column(name = "CUSTOMER_ID", nullable = false, length = 20)
    private String customerId;

    @Column(name = "CUSTOMER_NAME", nullable = false, length = 20)
    private String customerName;

    // 단방향 해시 암호화 (BCrypt 등)
    @Column(name = "CUSTOMER_PASSWORD", nullable = false, length = 100)
    private String customer_password;

    // AES 양방향 암호화 대상
    @Column(name = "CUSTOMER_RESIDENT_NUMBER", nullable = false, length = 100)
    private String customer_resident_number;

    @Column(name = "CUSTOMER_ADDRESS", nullable = false, columnDefinition = "CLOB")
    private String customer_address;

    // AES 양방향 암호화 대상
    @Column(name = "CUSTOMER_PHONE_NUMBER", length = 100)
    private String customerPhoneNumber;

    @Column(name = "CUSTOMER_EMAIL", length = 50)
    private String customer_email;

    @Column(name = "CUSTOMER_JOB", length = 20)
    private String customer_job;

    @Column(name = "CUSTOMER_ACCOUNT_NUMBER", nullable = false)
    private String customer_account_number;

    @Column(name = "CUSTOMER_BIRTHDAY", length = 20)
    private String customer_birthday;

    @Column(name = "CUSTOMER_RISK_TYPE")
    private String customer_risk_type;

    @javax.persistence.Transient
    private Integer current_limit;

    // AES 양방향 암호화 대상
    @javax.persistence.Transient
    private int account_pwd;

    private String customer_token;

    @Column(name = "REFRESH_TOKEN")
    private String refresh_token;

    // 아래는 MyBatis 호환용 getter/setter
    public String getCustomer_id() {
        return customerId;
    }

    public void setCustomer_id(String customer_id) {
        this.customerId = customer_id;
    }

    public String getCustomer_name() {
        return customerName;
    }

    public void setCustomer_name(String customer_name) {
        this.customerName = customer_name;
    }

    public String getCustomer_phone_number() {
        return customerPhoneNumber;
    }

    public void setCustomer_phone_number(String customer_phone_number) {
        this.customerPhoneNumber = customer_phone_number;
    }
}
