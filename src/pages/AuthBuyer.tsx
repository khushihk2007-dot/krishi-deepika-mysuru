import { PhoneAuthCard } from "@/components/auth/PhoneAuthCard";

export default function AuthBuyer() {
  return (
    <PhoneAuthCard
      role="buyer"
      redirectTo="/dashboard"
      extraFields={[
        { key: "company_name", labelKey: "auth.companyName" },
        { key: "business_id", labelKey: "auth.businessId" },
        { key: "primary_interest", labelKey: "auth.primaryInterest", type: "interest" },
      ]}
    />
  );
}
