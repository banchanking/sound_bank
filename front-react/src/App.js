import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import Footer from "./Common/Footer";
import Main from "./Common/Main";
import Header from "./Common/Header";
import LoanApply from "./sound_loan/customer/LoanApply";
import LoanStatus from "./sound_loan/customer/LoanStatus";
import LoanManage from "./sound_loan/customer/LoanManage";
import LoanService from "./sound_loan/customer/LoanService";
import LoanCustomerList from "./sound_loan/admin/LoanCustomerList";
import LoanList from "./sound_loan/admin/LoanList";
import LoanDetail from "./sound_loan/admin/LoanDetail";
import LoanUpdate from "./sound_loan/admin/LoanUpdate";
import Inquire from "./inquire/Inquire";
import InquireAccont from "./inquire/InquireAccont";
import InquireTransfer from "./inquire/InquireTransfer";
import InquireAssets from "./inquire/InquireAssets";
import Transfer from "./transfer/customer/Transfer";
import TransInstant from "./transfer/customer/TransInstant";
import TransAuto from "./transfer/customer/TransAuto";
import TransAutoEdit from "./transfer/customer/TransAutoEdit";
import TransMulti from "./transfer/customer/TransMulti";
import TransMultiEdit from "./transfer/customer/TransMultiEdit";
import TransLimit from "./transfer/customer/TransLimit";
import TransferAdmin from "./transfer/admin/TransferAdmin";
import LimitAdmin from "./transfer/admin/LimitAdmin";
import MultiAdmin from "./transfer/admin/MultiAdmin";
import Fund from "./fund/customer/Fund";
import FundSearch from "./fund/customer/FundSearch";
import FundList from "./fund/customer/FundList";
import FundTest from "./fund/customer/FundTest";
import FundTestResult from "./fund/customer/FundTestResult";
import FundRecommend from "./fund/customer/FundRecommend";
import MyFund from "./fund/customer/MyFund";
import MyFundInfo from "./fund/customer/MyFundInfo";
import OpenAccount from "./fund/customer/OpenAccount";
import CloseAccount from "./fund/customer/CloseAccount";
import TransHistory from "./fund/customer/TransHistory";
import FundProductAdmin from "./fund/admin/FundProductAdmin";
import FundProductManage from "./fund/admin/FundProductManage";
import FundTestManage from "./fund/admin/FundTestManage";
import FundCustomer from "./fund/admin/FundCustomer";
import FindFundCustomer from "./fund/admin/FindFundCustomer";
import OpenApplyList from "./fund/admin/OpenApplyList";
import CloseApplyList from "./fund/admin/CloseApplyList";
import CustomerTransHistory from "./fund/admin/CustomerTransHistory";
import DepositInquire from "./accountOverview/DepositInquire";
import TransactionHistory from "./accountOverview/TransactionHistory";
import DepositWithdrawal from "./accountOverview/DepositWithdrawal";
import FixedDeposit from "./productSubscription/FixedDeposit";
import InstallmentSavings from "./productSubscription/InstallmentSavings";
import Precautions from "./productSubscription/Precautions";
import DepositChange from "./depositManagement/DepositChange";
import AutoTransferSettings from "./depositManagement/AutoTransferSettings";
import TaxPreferenceManagement from "./depositManagement/TaxPreferenceManagement";
import DepositTermination from "./depositManagement/DepositTermination";
import Customerservice from "./customer_center/Customerservice";
import FAQ from "./customer_center/FAQ";
import Chatbot from "./customer_center/Chatbot";
import Voicebot from "./customer_center/Voicebot";

import Bankauth from "./customer_center/Bankauth";
import ExRate from "./exchange/customer/ExRate";
import ExRequest from "./exchange/customer/ExRequest";
import ExList from "./exchange/customer/ExList";
import ExAccountManagement from "./exchange/customer/ExAccountManagement";
import AdminExAccountRequestList from "./exchange/admin/AdminExAccountRequestList";
import AdminExAccountStatement from "./exchange/admin/AdminExAccountStatement";
import LoanInsertForm from "./sound_loan/admin/LoanInsertForm";
import LoanCalculator from "./sound_loan/customer/LoanCalculator";
import LoanChart from "./sound_loan/customer/LoanChart";
import LoanCreditScore from "./sound_loan/customer/LoanCreditScore";
import Join from "./customer/Join";
import Login from "./customer/Login";
import Authcenter from "./customer_center/Authcenter";
import SecurityBlocker from "./Common/SecurityBlocker";
import Charge from "./customer_center/Charge";
import Businesshour from "./customer_center/Businesshour";
import AdminNotice from "./customer_center/AdminNotice";
import Notice from "./customer_center/Notice";
import IdAuth from "./customer_center/Idauth";
import DepositJoin from "./productSubscription/DepositJoin";
import LoanAgreement from "./sound_loan/customer/LoanAgreement";
import LoanInfoApply from "./sound_loan/customer/LoanInfoApply";
import ExchangeWalletStatus from "./exchange/customer/ExchangeWalletStatus";
import LoanInterestList from "./sound_loan/admin/LoanInterestList";
import LoanLateInterestList from "./sound_loan/admin/LoanLateInterestList";
import MyLoanDetail from "./sound_loan/customer/MyLoanDetail";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* F12 방지 블록방지 */}{" "}
        {/* Header.js의 Link연동을 위해서 BrowserRouter추가해야됨 */}
        <Header />
        <Routes>
          <Route path="/" element={<Main />} />
          {/* 조회/입출금 Route 시작 */}
          <Route path="/depositInquire" element={<DepositInquire />} />
          <Route path="/transactionHistory" element={<TransactionHistory />} />
          <Route path="/depositWithdrawal" element={<DepositWithdrawal />} />
          {/* 조회/입출금 Route 끝 */}
          {/* 상품가입 Route 시작 */}
          <Route path="/fixedDeposit" element={<FixedDeposit />} />
          <Route path="/DepositJoin/:name" element={<DepositJoin />} />{" "}
          {/* ID를 URL 파라미터로 전달 */}
          <Route path="/installmentSavings" element={<InstallmentSavings />} />
          <Route path="/precautions" element={<Precautions />} />
          {/* 상품가입 Route 끝 */}
          {/* 예금관리 Route 시작 */}
          <Route path="/depositChange" element={<DepositChange />} />
          <Route
            path="/autoTransferSettings"
            element={<AutoTransferSettings />}
          />
          <Route
            path="/taxPreferenceManagement"
            element={<TaxPreferenceManagement />}
          />
          <Route path="/depositTermination" element={<DepositTermination />} />
          {/* 예금관리 Route 끝 */}
          {/* 조회 Route 시작 */}
          <Route path="/inquire" element={<Inquire />} />
          <Route path="/inquireAccont" element={<InquireAccont />} />
          <Route path="/inquireTransfer" element={<InquireTransfer />} />
          <Route path="/inquireAssets" element={<InquireAssets />} />
          {/* 조회 Route 끝 */}
          {/* 이체(고객) Route 시작 */}
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transInstant" element={<TransInstant />} />
          <Route path="/transAuto" element={<TransAuto />} />
          <Route path="/transAutoEdit" element={<TransAutoEdit />} />
          <Route path="/transMulti" element={<TransMulti />} />
          <Route path="/transMultiEdit" element={<TransMultiEdit />} />
          <Route path="/transLimit" element={<TransLimit />} />
          {/* 이체(고객) Route 끝 */}
          {/* 이체(관리자) Route 시작 */}
          <Route path="/transferAdmin" element={<TransferAdmin />} />
          <Route path="/limitAdmin" element={<LimitAdmin />} />
          <Route path="/multiAdmin" element={<MultiAdmin />} />
          {/* 이체(관리자) Route 끝 */}
          {/* 대출관련 Route 시작 */}
          <Route path="/loanApply" element={<LoanApply />} />
          <Route path="/loanAgreement/:loan_id" element={<LoanAgreement />} />
          <Route path="/loanInfoApply/:loan_id" element={<LoanInfoApply />} />
          <Route path="/loanStatus" element={<LoanStatus />} />
          <Route path="/loanManage" element={<LoanManage />} />
          <Route path="/loanService" element={<LoanService />} />
          <Route path="/loanCalculator" element={<LoanCalculator />} />
          <Route path="/loanChart" element={<LoanChart />} />
          <Route path="/loanCreditScore" element={<LoanCreditScore />} />
          <Route path="/loanList" element={<LoanList />} />
          <Route path="/loanInsertForm" element={<LoanInsertForm />} />
          <Route path="/loanDetail/:loan_id" element={<LoanDetail />} />
          <Route path="/loanUpdate/:loan_id" element={<LoanUpdate />} />
          <Route path="/loanCustomerList" element={<LoanCustomerList />} />
          <Route path="/loanInterestList" element={<LoanInterestList />} />
          <Route
            path="/loanLateInterestList"
            element={<LoanLateInterestList />}
          />
          <Route path="/myLoanDetail" element={<MyLoanDetail />} />
          {/* 대출관련 Route 종료 */}
          {/* 펀드 Route 시작 */}
          <Route path="/fund" element={<Fund />} />
          <Route path="/fundSearch" element={<FundSearch />} />
          <Route path="/fundList" element={<FundList />} />
          <Route path="/fundTest" element={<FundTest />} />
          <Route path="/test-result" element={<FundTestResult />} />
          <Route path="/fundRecommend" element={<FundRecommend />} />
          <Route path="/myFund" element={<MyFund />} />
          <Route path="/myFundInfo" element={<MyFundInfo />} />
          <Route path="/openAccount" element={<OpenAccount />} />
          <Route path="/closeAccount" element={<CloseAccount />} />
          <Route path="/transHistory" element={<TransHistory />} />
          <Route path="/fundProductAdmin" element={<FundProductAdmin />} />
          <Route path="/fundProductManage" element={<FundProductManage />} />
          <Route path="/fundTestManage" element={<FundTestManage />} />
          <Route path="/fundCustomer" element={<FundCustomer />} />
          <Route path="/findFundCustomer" element={<FindFundCustomer />} />
          <Route path="/openApplyList" element={<OpenApplyList />} />
          <Route path="/closeApplyList" element={<CloseApplyList />} />
          <Route
            path="/customerTransHistory"
            element={<CustomerTransHistory />}
          />
          {/* 펀드 Route 끝 */}
          {/* 외환 Route 시작 */}
          <Route path="/ex_rate" element={<ExRate />} /> {/* 환율조회/계산기 */}
          <Route path="/ex_request" element={<ExRequest />} />{" "}
          {/* 환전신청하기 */}
          <Route path="/exchange_list" element={<ExList />} />{" "}
          {/* 환전내역 조회 */}
          <Route
            path="/ex_account_management"
            element={<ExAccountManagement />}
          />{" "}
          {/* 외환 지갑 해지 */}
          <Route
            path="/exchange_wallet_status"
            element={<ExchangeWalletStatus />}
          />{" "}
          {/* 내 지갑 */}
          <Route
            path="/admin_ex_request_list"
            element={<AdminExAccountRequestList />}
          />{" "}
          {/* 환전 신청 현황 (customer로 이동됨) */}
          <Route
            path="/admin_ex_management"
            element={<AdminExAccountStatement />}
          />{" "}
          {/* (관리자)지갑상태변경 */}
          {/* 외환 Route 끝 */}
          {/* 고객센터 Route 시작 */}
          <Route path="/customerservice" element={<Customerservice />} />{" "}
          {/* 고객센터 헤더 */}
          <Route path="/faq" element={<FAQ />} /> {/* 자주하는 질문  */}
          <Route path="/chatbot" element={<Chatbot />} />{" "}
          {/* 누르는 상담 (챗봇) */}
          <Route path="/voicebot" element={<Voicebot />} />{" "}
          {/* 말하는 상담 (음성봇) */}
          <Route path="/authcenter" element={<Authcenter />} />{" "}
          {/* 인증 센터  */}
          <Route path="/bankauth" element={<Bankauth />} /> {/* 통장 인증 */}
          <Route path="/idauth" element={<IdAuth />} />{" "}
          {/* 주민등록증인증 (OCR) */}
          <Route path="/notice" element={<Notice />} /> {/* 공지사항(고객용) */}
          <Route path="/admin/notice" element={<AdminNotice />} />{" "}
          {/* 공지사항(관리자용) */}
          <Route path="/business_hour" elemen={<Businesshour />} />{" "}
          {/* 이용 시간 */}
          <Route path="/charge" element={<Charge />} /> {/* 금리 안내 */}
          {/* 고객센터 Route 끝 */}
          {/* 계좌개설 / 로그인 Route 시작 */}
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          {/* 계좌개설 / 로그인 Route 끝 */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
