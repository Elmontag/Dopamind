import { useI18n } from "../i18n/I18nContext";
import FocusTimer from "../components/FocusTimer";

export default function TimeManagementPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">{t("zeitmanagement.title")}</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">{t("zeitmanagement.hint")}</p>
      </div>
      <div className="max-w-sm">
        <FocusTimer />
      </div>
    </div>
  );
}
