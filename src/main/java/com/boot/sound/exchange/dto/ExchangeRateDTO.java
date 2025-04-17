package com.boot.sound.exchange.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExchangeRateDTO {

    @JsonProperty("cur_unit")
    private String currency_code; // 통화 코드

    @JsonProperty("cur_nm")
    private String currency_name; //	통화 이름

    @JsonProperty("deal_bas_r")
    private String base_rate;  // 기준 환율

    @JsonProperty("ttb")
    private String sell_rate;  // 고객이 외화를 팔 때 (은행 입장에서 매입)

    @JsonProperty("tts")
    private String buy_rate;   // 고객이 외화를 살 때 (은행 입장에서 매도)
    
    private LocalDate base_date;

}

//-- 환율저장테이블
//CREATE TABLE exchange_rate (
//  base_date DATE NOT NULL,                      -- 기준일  PK
//  currency_code VARCHAR(10) NOT NULL,           -- 통화코드 (예: USD, JPY) PK
//  currency_name VARCHAR(50),                    -- 통화 이름 (예: 미국 달러)
//  base_rate DECIMAL(12,6) NOT NULL,             -- 기준 환율
//  buy_rate DECIMAL(12,6),                       -- 매입 환율
//  sell_rate DECIMAL(12,6),                      -- 매도 환율
//  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//
//  PRIMARY KEY (base_date, currency_code)        -- 복합 PK로 지정
//) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
