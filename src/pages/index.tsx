import Head from "next/head";
import data from "./data.json";
import { format, differenceInHours,isBefore } from "date-fns";

type CustomerData = {
  Name: string;
  Location: "US" | "Europe";
  SignupDate: string;
  Source: "phone" | "web app";
  InvestmentDate: string;
  InvestmentTime: string;
  RefundDate: string;
  RefundTime: string;
};

type StandardCustomerData = {
  Name: string;
  Location: "US" | "Europe";
  SignupDate: Date;
  Source: "phone" | "web app";
  InvestmentDate: Date;
  RefundDate: Date;
  isRequestValid: boolean;
};

const parseCustomerInfo = (customer: CustomerData) => {
  const signupDate = customer.SignupDate.split("/");
  const investmentDate = customer.InvestmentDate.split("/");
  const refundDate = customer.RefundDate.split("/");
  const isUS = customer.Location === "US";
  // Convert to US format for consistency
  const signupDateFormat = isUS
    ? `${signupDate[0]}/${signupDate[1]}/${signupDate[2]}`
    : `${signupDate[1]}/${signupDate[0]}/${signupDate[2]}`;
  const investmentDateFormat = isUS
    ? `${investmentDate[0]}/${investmentDate[1]}/${investmentDate[2]}`
    : `${investmentDate[1]}/${investmentDate[0]}/${investmentDate[2]}`;
  const refundDateFormat = isUS
    ? `${refundDate[0]}/${refundDate[1]}/${refundDate[2]}`
    : `${refundDate[1]}/${refundDate[0]}/${refundDate[2]}`;

  return {
    ...customer,
    SignupDate: new Date(signupDateFormat),
    InvestmentDate: new Date(
      investmentDateFormat + " " + customer.InvestmentTime,
    ),
    RefundDate: new Date(refundDateFormat + " " + customer.RefundTime),
    isRequestValid : false,
  } as StandardCustomerData;
};

function calculateRequestTiming(customer: StandardCustomerData): number {
  const investmentTimestamp = customer.InvestmentDate.getTime();
  const refundTimestamp =  customer.RefundDate.getTime();
  const timeDiffInHours =
    (refundTimestamp - investmentTimestamp) / (60 * 60 * 1000);
  return timeDiffInHours;
}

const calculateRefundPeriod = (customer: StandardCustomerData) => {
  const isOldTOS =  isBefore(customer.SignupDate, new Date("01-02-2020"));
  switch (customer.Source) {
    case "phone":
      return isOldTOS ? 4 : 8;
    case "web app":
      return isOldTOS ? 8 : 16;
    default:
      throw new Error("Invalid Source");
  }
};

const evaluate = (data: CustomerData) => {
  const customer = parseCustomerInfo(data);
  const requestTiming = calculateRequestTiming(customer);
  const refundPeriod = calculateRefundPeriod(customer);
  const isRequestValid = requestTiming <= refundPeriod;
  return {
    ...customer,
    requestTiming,
    refundPeriod,
    isRequestValid,
  };
};

export default function Home() {
  const customerData = (data as CustomerData[]).map(evaluate); 

  return (
    <>
      <Head>
        <title>Further Take Home</title>
        <meta name="description" content="Further Loan Status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[3rem]">
            Further Loan Status Evaluator
          </h1>
          <table className="w-full table-auto text-black">
            <thead>
              <tr className="bg-gray-300">
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Name
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Location
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Signup Date (Europe Standard)
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Source
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Investment Date
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Refund Date
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Refund Hours
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Refund Period
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  TOS
                </th>
                <th className="px-4 py-3 text-lg font-semibold underline">
                  Request Status
                </th>
              </tr>
            </thead>
            <tbody>
              {customerData.map((customer) => (
                <tr
                  key={customer.Name}
                  className={`${
                    customer.isRequestValid ? "bg-green-200" : "bg-red-200"
                  } transition-colors duration-300 hover:bg-gray-100`}
                >
                  <td className="border px-4 py-2">{customer.Name}</td>
                  <td className="border px-4 py-2">{customer.Location}</td>
                  <td className="border px-4 py-2">
                    {format(customer.SignupDate, "dd/MM/yyyy - HH:mm")}
                  </td>
                  <td className="border px-4 py-2">{customer.Source}</td>
                  <td className="border px-4 py-2">
                    {format(customer.InvestmentDate, "dd/MM/yyyy - HH:mm")}
                  </td>
                  <td className="border px-4 py-2">
                    {format(customer.RefundDate, "dd/MM/yyyy - HH:mm")}
                  </td>
                  <td className="border px-4 py-2">
                    {differenceInHours(
                      customer.RefundDate,
                      customer.InvestmentDate,
                    )}
                    h
                  </td>
                  <td className="border px-4 py-2">{customer.refundPeriod}</td>
                  <td className="border px-4 py-2">
                    {isBefore(customer.SignupDate, new Date("01-02-2020")) ? "Old" : "New"}
                  </td>

                  <td className="border px-4 py-2">
                    {customer.isRequestValid ? (
                      <span className="text-green-600">Valid</span>
                    ) : (
                      <span className="text-red-600">Invalid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
