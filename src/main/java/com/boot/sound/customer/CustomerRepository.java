package com.boot.sound.customer;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerDTO, String> {

	@Query("SELECT c.customer_password FROM CustomerDTO c WHERE c.customerId = :customerId")
	String findPasswordById(@Param("customerId") String customerId);
	
	Optional<CustomerDTO> findByCustomerPhoneNumberAndCustomerNameAndCustomerId(String customerPhoneNumber, String customerName, String customerId);
}