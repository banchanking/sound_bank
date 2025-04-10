import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../Css/loan/LoanAgreement.css";
import RefreshToken from "../../jwt/RefreshToken";
import SMSVerificationModal from "../../smsmodal/SMSVerificationModal";

const LoanAgreement = () => {
  const navigate = useNavigate();
  const { loan_id } = useParams();
  const [consent, setConsent] = useState([
    {
      loan_id: 0,
      customerId: "",
      consent_use1: "N",
      consent_use2: "N",
      consent_use3: "N",
      consent_use4: "N",
      consent_view1: "N",
      consent_view2: "N",
      consent_view3: "N",
      consent_view4: "N",
    },
  ]);
  const [showOffer, setShowOffer] = useState(true);
  const [showView, setShowView] = useState(false);

  // 개인정보 제공동의 화면
  const ShowOffer = () => {
    setShowOffer(true);
    setShowView(false);
  };
  // 개인정보 조회동의 화면
  const ShowView = () => {
    setShowOffer(false);
    setShowView(true);
  };
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);

  useEffect(() => {
    setConsent((prevConsent) => ({
      ...prevConsent,
      loan_id: loan_id,
      customerId: localStorage.getItem("customerId"),
    }));
  }, [loan_id]); // loan_id 가 변경될 때만 useEffect 가 실행됩니다.

  // SMS 인증 성공 시 호출되는 콜백
  const handleSMSVerified = () => {
    // 모달을 닫고 다음 페이지로 이동
    setIsSMSModalOpen(false);
    navigate("/loanInfoApply/" + loan_id);
  };

  const nextStep = () => {
    if (
      consent.consent_use1 === "Y" &&
      consent.consent_use2 === "Y" &&
      consent.consent_use3 === "Y" &&
      consent.consent_use4 === "Y" &&
      consent.consent_view1 === "Y" &&
      consent.consent_view2 === "Y" &&
      consent.consent_view3 === "Y" &&
      consent.consent_view4 === "Y"
    ) {
      if (
        window.confirm(
          "확인버튼을 누르면 대출신청정보 작성 페이지로 이동하며 [귀 행]의 신용점수에 영향을 줄 수 있습니다. 진행 하시겠습니까?"
        )
      ) {
        RefreshToken.post("/consertInsert", consent)
          .then((res) => {
            if (res && res.status === 201) {
              // 응답이 성공하면 바로 다음 페이지로 이동하지 않고 SMS 인증 모달을 엽니다.
              setIsSMSModalOpen(true);
            } else {
              console.log(res);
              alert("요청 실패! 서버 응답이 올바르지 않습니다.");
            }
          })
          .catch((err) => {
            console.error("Axios error:", err);
            alert("서버 오류 발생!");
          });
      } else {
        navigate("/loanApply");
      }
    } else {
      alert("필수 동의가 체크되지 않았습니다");
    }
  };

  const consentChange = (e) => {
    setConsent({
      ...consent,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <div className="TitleArea">
        <div className="Title">개인신용정보동의</div>
      </div>
      <div className="textArea">
        <div className="text">
          여신거래를 위하여 다음 개인(신용)정보 이용, 제공, 조회의 반드시 동의가
          필요합니다. <br />각 탭의 내용을 확인하신 후 동의해 주시기 바랍니다.
        </div>
      </div>
      <div className="AgreementBtn">
        <button onClick={ShowOffer}>개인(신용)정보 수집 이용제공 동의서</button>
        <button onClick={ShowView}>개인(신용)정보 조회 동의서</button>
      </div>
      {/* 개인(신용)정보 수집 이용·제공 동의서 */}
      {showOffer && (
        <div>
          <div className="OfferTextArea">
            <div className="OfferTitle">
              개인(신용)정보 수집 이용·제공 동의서
            </div>
            <div className="OfferText1">
              {" "}
              [귀 행]과의 여신(금융)거래와 관련하여 [귀 행]이 본인의
              개인(신용)정보를 수집·이용하거나, 제3자에게 제공하고자 하는
              경우에는 「신용정보의 이용 및 보호에 관한 법률」 제15조 제2항,
              제32조 제1항, 같은 법 시행령 제34조의2 제4항 및, 「개인(신용)정보
              보호법」 제15조 제1항 제1호, 제17조 제1항 제1호, 제24조 제1항
              제1호, 제24조의2 제1항에 따라 본인의 동의가 필요합니다.
            </div>
            <div className="OfferText2">
              * 여신 (금융)거래라 함은 은행업무(여신), 겸영업무(파생상품매매
              등), 부수업무(보증,팩토링 등)와 관련된 거래를 의미합니다.
            </div>
            <div className="OfferText3">
              * 필수사항에 대한 동의만으로 계약 체결이 가능합니다.
            </div>
          </div>
          <div className="OfferArea">
            <table className="OfferTable">
              <thead>
                <tr>
                  <th colSpan={6} className="leftth">
                    1.수집·이용에 관한 사항
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ width: "150px" }}>수집·이용 목적</th>
                  <td className="purpose" colSpan={5}>
                    ￭ (금융)거래관계의 설정 여부 판단 ￭ (금융)거래관계의
                    설정·유지·이행·관리 <br />￭ 금융사고 조사, 분쟁 해결, 민원
                    처리 ￭ 법령상 의무이행
                  </td>
                </tr>
                <tr>
                  <th>수집·이용할 항목</th>
                  <td colSpan={5}>
                    [필수정보] ￭ 공통정보 ‣ 성명, 고유식별정보, 주소, 연락처,
                    직업군, 국적 ￭ 신용평가를 위한 정보(신용평가를 수반하지 않는
                    대출 제외) ‣
                    직업,직장명,근무부서,직위,입사일자,직무,연소득,주택소유여부,주거종류,주거상황
                    ￭ (금융)거래정보 ‣ 상품종류, 거래조건(이자율, 만기 등),
                    거래일시, 금액 등 거래 설정 · 내역 정보 및 (금융)거래의 설정
                    · 유지 · 이행 · 관리를 위한 상담을 통해 생성되는 정보 ￭ 고객
                    ID, 접속일시, IP주소, 이용 전화번호 등 전자금융거래법에 따른
                    수집 정보 [전자금융거래에 한함] ※ 본 동의 이전에 발생한
                    개인정보도 포함됩니다.
                  </td>
                </tr>
                <tr>
                  <th>보유·이용 기간</th>
                  <td colSpan={5}>
                    위 개인(신용)정보는 (금융)거래 종료일* 로부터 5년까지
                    보유·이용됩니다. (금융)거래 종료일 후에는 금융사고 조사,
                    분쟁 해결, 민원처리, 법령상 의무이행 및 리스크 관리업무만을
                    위하여 보유·이용됩니다. * (금융)거래 종료일이란 당행과
                    거래중인 모든 계약(여·수신, 내·외국환 및 제3자 담보제공 등)
                    및 서비스(대여금고, 보호예수, 외국환거래지정, 인터넷뱅킹
                    포함 전자금융거래 등)가 종료한 날을 뜻합니다.
                  </td>
                </tr>
                <tr>
                  <th>동의를 거부할 권리 및 동의를 거부할 경우의 불이익</th>
                  <td colSpan={5}>
                    위 개인(신용)정보 수집 · 이용에 관한 동의는 계약의 체결 및
                    이행을 위하여 필수적이므로, 위 사항에 동의하셔야만
                    (금융)거래관계의 설정 및 유지가 가능합니다.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>개인(신용)정보 수집·이용 동의 여부</th>
                  <td>
                    [귀 행]이 위와 같이 본인의 개인(신용)정보를 제공하는 것에
                    동의합니다.
                  </td>
                  <th>동의하지않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use1"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use1"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>고유식별정보 수집·이용 동의 여부</th>
                  <td>
                    [귀 행]이 위 목적으로 본인의 고유식별정보를 수집·이용하는
                    것에 동의합니다.
                  </td>
                  <th>동의하지않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use2"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use2"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="OfferArea">
            <table className="OfferTable">
              <thead>
                <tr>
                  <th colSpan={6} className="leftth">
                    2.제공에 관한 사항
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ width: "150px" }}>제공받는 자</th>
                  <td colSpan={5}>
                    ￭ 신용정보집중기관 및 신용조회회사에 대한 제공
                    <br />‣ 신용정보집중기관 : [한국신용정보원]
                    <br />‣ 신용조회회사 : [코리아크레딧뷰로(주),
                    NICE평가정보(주), 한국기업데이터(주)]
                  </td>
                </tr>
                <tr>
                  <th>제공받는 자의 이용 목적</th>
                  <td colSpan={5}>
                    ￭ 신용정보집중기관 및 신용조회회사에 대한 제공
                    <br />‣ 본인의 신용을 판단하기 위한 자료로 활용하거나
                    공공기관에서 정책자료로 활용
                  </td>
                </tr>
                <tr>
                  <th>제공한 개인(신용)정보의 항목</th>
                  <td colSpan={5}>
                    ￭ 신용정보집중기관 및 신용조회회사에게 제공되는
                    개인(신용)정보의 항목
                    <br />‣
                    개인식별정보,신용거래정보,신용능력정보,신용도판단정보,
                    신용평가를 위한 정보
                  </td>
                </tr>
                <tr>
                  <th>제공 및 변경에 관한 세부사항</th>
                  <td colSpan={5}>
                    ￭ [당 행]은 위 수탁업체에게 개인(신용)정보를 제공할 경우,
                    업무수행에 필요 최소환의 정보만을 제공하며, 위 제공대상 업체
                    현황·제공대상 개인(신용)정보 이용목적·제공대상
                    개인(신용)정보 항목의 세부적 내용은 [당 행]홈페이지*에서
                    확인하실 수 있습니다. <br />￭ [당 행]은 위 사항의 변경이
                    있을 경우에는 위 홈페이지*에 변경 내용을 게시합니다.
                    *홈페이지 주소 :
                    https://www.wooribank.com→고객광장→보안센터→개인정보보호정책→개인정보처리(취급)방침→위탁업체
                  </td>
                </tr>
                <tr>
                  <th>제공받은 자의 개인(신용)정보 보유 · 이용 기간</th>
                  <td colSpan={5}>
                    ￭ 신용정보집중기관 및 신용조회회사에 대한 제공
                    <br />‣ 등록사유 발생과 관련이 있는 거래가 존속하는 기간
                    <br />￭ 제공된 목적 달성 후에는 위에 기재된 이용 목적과
                    관련된 금융사고 조사, 분쟁 해결, 민원처리, 법령상 의무이행을
                    위하여 필요한 범7 내에서만 보유·이용됩니다.
                  </td>
                </tr>
                <tr>
                  <th>동의를 거부할 권리 및 동의를 거부할 경우의 불이익</th>
                  <td colSpan={5}>
                    위 개인(신용)정보의 제공에 관한 동의는 계약의 체결 및 이행을
                    위하여 필수적이므로, 위 사항에 동의하셔야만 (금융)거래관계의
                    설정 및 유지가 가능합니다.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>개인(신용)정보 제공 동의 여부</th>
                  <td>
                    [귀 행]이 위와 같이 본인의 개인(신용)정보를 제공하는 것에
                    동의합니다.
                  </td>
                  <th>동의하지 않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use3"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use3"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>고유식별정보 제공 동의 여부</th>
                  <td>
                    [귀 행]이 위 목적으로 본인의 고유식별정보를 제공하는 것에
                    동의합니다.
                  </td>
                  <th>동의하지 않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use4"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_use4"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      {/* 개인(신용)정보 조회 동의서 */}
      {showView && (
        <div>
          <div className="OfferTextArea">
            <div className="OfferTitle">개인(신용)정보 조회 동의서</div>
            <div className="OfferText1">
              {" "}
              [귀 행]과의 여신(금융)거래와 관련하여 [귀 행]이 본인의
              개인(신용)정보를 조회하고자 하는 경우에는 「신용정보의 이용 및
              보호에 관한 법률」제15조 제2항, 제32조 제1항 및 「개인정보
              보호법」 제15조 제1항 제1호, 제17조 제1항 제1호, 제24조 제1항
              제1호, 제24조의2 1항에 따라 본인의 동의가 필요합니다.
            </div>
          </div>
          <div className="OfferArea">
            <table className="OfferTable">
              <thead>
                <tr>
                  <th colSpan={6} className="leftth">
                    1.수집·이용에 관한 사항
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ width: "150px" }}>수집·이용 목적</th>
                  <td className="purpose" colSpan={5}>
                    ￭ 여신(금융)거래와 관련하여 신용조회회사 또는
                    신용정보집중기관에 개인(신용)정보 조회
                  </td>
                </tr>
                <tr>
                  <th>수집·이용할 항목</th>
                  <td colSpan={5}>
                    ￭ 성명, 고유식별정보, 주소, 전화번호 등 연락처
                  </td>
                </tr>
                <tr>
                  <th>보유·이용 기간</th>
                  <td colSpan={5}>
                    ￭ 귀하의 개인(신용)정보는 수집 · 이용에 관한 동의일로부터
                    본인에 대한 신용정보 조회 동의의 효력 기간까지 보유 ·
                    이용됩니다. 단, 신용정보 조회 동의의 효력 기간 종료 후에는
                    금융사고 조사, 분쟁 해결, 민원처리 및 법령상 의무이행만을
                    위하여 보유 · 이용됩니다.
                  </td>
                </tr>
                <tr>
                  <th>동의를 거부할 권리 및 동의를 거부할 경우의 불이익</th>
                  <td colSpan={5}>
                    ￭ 위 개인(신용)정보 수집 · 이용에 관한 동의는 계약의 체결 및
                    이행을 위하여 필수적이므로, 위 사항에 동의하셔야만
                    여신(금융) 거래관계의 설정 및 유지가 가능합니다.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>개인(신용)정보 수집·이용 동의 여부</th>
                  <td>
                    [귀 행]이 위와 같이 본인의 개인(신용)정보를 수집 · 이용하는
                    것에 동의합니다.
                  </td>
                  <th>동의하지않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view1"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view1"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>고유식별정보 수집·이용 동의 여부</th>
                  <td>
                    [귀 행]이 위 목적으로 본인의 고유식별정보를 수집 · 이용하는
                    것에 동의합니다.
                  </td>
                  <th>동의하지않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view2"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view2"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="OfferArea">
            <table className="OfferTable">
              <thead>
                <tr>
                  <th colSpan={6} className="leftth">
                    2. 제공 · 조회에 관한 사항
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ width: "150px" }}>제공 · 조회대상기관</th>
                  <td colSpan={5}>
                    ￭ 신용정보집중기관 : [한국신용정보원]
                    <br /> ￭ 신용조회회사 : [코리아크레딧뷰로(주),
                    NICE평가정보(주), 한국기업데이터(주)] ※ 신용조회회사 및
                    신용정보집중기관의 세부 현황은 [당 행]홈페이지*에서 확인하실
                    수 있습니다.
                    *https://www.wooribank.com→고객광장→보안센터→개인정보보호정책→개인신용정보관리보호→신용정보활용체제
                  </td>
                </tr>
                <tr>
                  <th>제공 · 조회 목적</th>
                  <td colSpan={5}>
                    ￭ 여신(금융)거래와 관련하여 신용조회회사 또는
                    신용정보집중기관에 개인(신용)정보 조회
                  </td>
                </tr>
                <tr>
                  <th>제공 · 조회할 개인(신용)정보</th>
                  <td colSpan={5}>
                    ￭ 개인식별정보:[성명, 고유식별정보, 국적, 직업, 주소,
                    전자우편 주소, 전화번호 등 연락처] <br />
                    ￭신용도판단정보:[연체정보, 대위변제 · 대지급정보 등]
                    <br />
                    ￭신용거래정보:[대출(현금서비스 포함), 채무보증,
                    신용카드(체크카드 포함), 당좌(가계당좌)예금 등] <br />
                    ￭신용능력정보:[재산 · 채무 · 소득의 총액, 납세실적 등]{" "}
                    <br />
                    ￭신용등급 및 평점정보
                  </td>
                </tr>
                <tr>
                  <th>제공 및 변경에 관한 세부사항</th>
                  <td colSpan={5}>
                    ￭ [당 행]은 위 수탁업체에게 개인(신용)정보를 제공할 경우,
                    업무수행에 필요 최소환의 정보만을 제공하며, 위 제공대상 업체
                    현황·제공대상 개인(신용)정보 이용목적·제공대상
                    개인(신용)정보 항목의 세부적 내용은 [당 행]홈페이지*에서
                    확인하실 수 있습니다. <br />￭ [당 행]은 위 사항의 변경이
                    있을 경우에는 위 홈페이지*에 변경 내용을 게시합니다.
                    *홈페이지 주소 :
                    https://www.wooribank.com→고객광장→보안센터→개인정보보호정책→개인정보처리(취급)방침→위탁업체
                  </td>
                </tr>
                <tr>
                  <th>제공 · 조회 동의의 효력 기간</th>
                  <td colSpan={5}>
                    ￭ [당행]의 조회 결과 귀하와의 여신(금융)거래가 개시되는
                    경우에는 해당 여신(금융)거래 종료일까지 조회 동의의 효력이
                    지속됩니다. 다만, [당행]의조회 결과 귀하가 신청한
                    여신(금융)거래의 설정이 거절된 경우에는 그 시점부터 동의의
                    효력은 소멸합니다.
                  </td>
                </tr>
                <tr>
                  <th>동의를 거부할 권리 및 동의를 거부할 경우의 불이익</th>
                  <td colSpan={5}>
                    ￭ 위 개인(신용)정보 조회에 관한 동의는 계약의 체결 및 이행을
                    위하여 필수적이므로, 위 사항에 동의하셔야만 여신(금융)
                    거래관계의 설정 및 유지가 가능합니다.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>개인(신용)정보 제공 · 조회 동의 여부</th>
                  <td>
                    [귀 행]이 위와 같이 본인의 개인(신용)정보를 제공조회하는
                    것에 동의합니다.
                  </td>
                  <th>동의하지 않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view3"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view3"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>고유식별정보 제공 동의 여부</th>
                  <td>
                    [귀 행]이 위 목적으로 본인의 고유식별정보를 제공하는 것에
                    동의합니다.
                  </td>
                  <th>동의하지 않음</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view4"
                      value={"N"}
                      onChange={consentChange}
                    />
                  </td>
                  <th>동의함</th>
                  <td>
                    <input
                      type="radio"
                      name="consent_view4"
                      value={"Y"}
                      onChange={consentChange}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      <div className="FinalArea">
        <div className="FinalText">
          <span>
            * 고유식별정보는 「신용정보의 이용 및 보호에 관한 법률 시행령」
            제29조 각호에 따른 <br /> [주민등록번호, 여권번호, 운전면허번호,
            외국인등록번호, 국내거소신고번호]를 의미합니다.
          </span>
          <span>
            * [당 행]이 신용조회회사를 통하여 귀하의 개인(신용)정보를 조회한
            기록은 타 금융기관 등에 제공될 수 있으며, 이에 따라 귀하의
            신용등급이 하락할 수 있음을 알려드립니다.
          </span>
          <span>
            * 본인이 동의한 목적 또는 이용범위 내에서 개인(신용)정보의 정확성,
            최신성을 유지하기 위해 제공하는 경우에는 별도의 추가 동의가 필요하지
            않습니다.
          </span>
        </div>
        <div className="FinalBtn">
          <span>본인은 본 동의서의 내용을 이해하였으며 확인하였습니다.</span>
          <button onClick={nextStep}>확인</button>
          <button>취소</button>
        </div>
      </div>

      <SMSVerificationModal
        isOpen={isSMSModalOpen}
        onRequestClose={() => setIsSMSModalOpen(false)}
        onVerified={handleSMSVerified}
      />
    </div>
  );
};

export default LoanAgreement;
