import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useMail } from "../context/MailContext";
import { useSettings } from "../context/SettingsContext";
import {
  Mail,
  Reply,
  Trash2,
  Archive,
  Tag,
  Send,
  X,
  ChevronLeft,
  Inbox,
  FileText,
  AlertCircle,
  CheckSquare,
  Clock,
  Star,
} from "lucide-react";

const TAG_COLORS = {
  important: "bg-danger/10 text-danger",
  todo: "bg-accent/10 text-accent",
  waiting: "bg-warn/10 text-amber-700 dark:text-warn",
  done: "bg-success/10 text-success",
};

const TAG_ICONS = {
  important: Star,
  todo: CheckSquare,
  waiting: Clock,
  done: CheckSquare,
};

const FOLDERS = [
  { key: "inbox", folder: "INBOX", icon: Inbox },
  { key: "sent", folder: "Sent", icon: Send },
  { key: "drafts", folder: "Drafts", icon: FileText },
  { key: "trash", folder: "Trash", icon: Trash2 },
  { key: "archive", folder: "Archive", icon: Archive },
];

function MailCompose({ mail, onSend, onDiscard, t }) {
  const [to, setTo] = useState(mail?.to || "");
  const [cc, setCc] = useState(mail?.cc || "");
  const [subject, setSubject] = useState(mail?.subject || "");
  const [body, setBody] = useState(mail?.body || "");

  const handleSend = (e) => {
    e.preventDefault();
    onSend({ to, cc, subject, body, replyTo: mail?.replyTo });
  };

  return (
    <form onSubmit={handleSend} className="glass-card p-5 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          {mail?.replyTo ? t("mail.reply") : t("mail.compose")}
        </h3>
        <button type="button" onClick={onDiscard} className="btn-ghost p-1.5">
          <X className="w-4 h-4" />
        </button>
      </div>
      <input
        type="email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder={t("mail.to")}
        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        required
      />
      <input
        type="text"
        value={cc}
        onChange={(e) => setCc(e.target.value)}
        placeholder={t("mail.cc")}
        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder={t("mail.subject")}
        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        required
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("mail.body")}
        rows={8}
        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-sm flex items-center gap-2">
          <Send className="w-4 h-4" /> {t("mail.send")}
        </button>
        <button type="button" onClick={onDiscard} className="btn-ghost text-sm">
          {t("mail.discard")}
        </button>
      </div>
    </form>
  );
}

function MailDetail({ mail, t, onReply, onDelete, onArchive, onTag, onBack }) {
  const [showTags, setShowTags] = useState(false);

  return (
    <div className="glass-card p-5 animate-fade-in">
      <button onClick={onBack} className="btn-ghost text-sm mb-4 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> {t("nav.mail")}
      </button>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">{mail.subject}</h3>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-light dark:text-muted-dark">
          <span className="font-medium text-gray-700 dark:text-gray-300">{mail.from}</span>
          <span>&middot;</span>
          <span>{new Date(mail.date).toLocaleString()}</span>
        </div>
        {mail.tags?.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {mail.tags.map((tag) => (
              <span key={tag} className={`badge text-[10px] ${TAG_COLORS[tag] || "bg-gray-100 dark:bg-white/5"}`}>
                {t(`mail.tags.${tag}`) || tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={onReply} className="btn-ghost text-sm flex items-center gap-1.5">
          <Reply className="w-4 h-4" /> {t("mail.reply")}
        </button>
        <button onClick={onArchive} className="btn-ghost text-sm flex items-center gap-1.5">
          <Archive className="w-4 h-4" /> {t("mail.archive")}
        </button>
        <div className="relative">
          <button onClick={() => setShowTags(!showTags)} className="btn-ghost text-sm flex items-center gap-1.5">
            <Tag className="w-4 h-4" /> {t("mail.tag")}
          </button>
          {showTags && (
            <div className="absolute top-full left-0 mt-1 glass-card p-2 min-w-[140px] z-10 space-y-1">
              {Object.keys(TAG_COLORS).map((tag) => {
                const TagIcon = TAG_ICONS[tag];
                return (
                  <button
                    key={tag}
                    onClick={() => { onTag(tag); setShowTags(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <TagIcon className="w-3.5 h-3.5" />
                    {t(`mail.tags.${tag}`)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button onClick={onDelete} className="btn-ghost text-sm flex items-center gap-1.5 text-danger hover:bg-danger/10">
          <Trash2 className="w-4 h-4" /> {t("mail.delete")}
        </button>
      </div>

      {/* Body */}
      <div className="text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-white/[0.02] rounded-xl p-4">
        {mail.body || mail.preview || ""}
      </div>
    </div>
  );
}

export default function MailPage() {
  const { t } = useI18n();
  const { isMailConfigured } = useSettings();
  const {
    state,
    fetchMails,
    selectMail,
    deleteMail,
    archiveMail,
    tagMail,
    sendMail,
    startCompose,
    startReply,
    dispatch,
  } = useMail();

  const [activeFolder, setActiveFolder] = useState("INBOX");

  useEffect(() => {
    if (isMailConfigured) fetchMails(activeFolder);
  }, [isMailConfigured, activeFolder, fetchMails]);

  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
    selectMail(null);
  };

  // Not configured state
  if (!isMailConfigured) {
    return (
      <div className="animate-fade-in">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-muted-light dark:text-muted-dark mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("mail.title")}</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
            {t("mail.connectionError")}
          </p>
          <a href="/settings" className="btn-primary text-sm inline-block">
            {t("nav.settings")}
          </a>
        </div>
      </div>
    );
  }

  // Compose mode
  if (state.composing) {
    return (
      <div className="animate-fade-in max-w-2xl">
        <MailCompose
          mail={state.composing}
          onSend={sendMail}
          onDiscard={() => dispatch({ type: "SET_COMPOSING", payload: null })}
          t={t}
        />
      </div>
    );
  }

  // Detail view
  if (state.selectedMail) {
    return (
      <div className="animate-fade-in max-w-3xl">
        <MailDetail
          mail={state.selectedMail}
          t={t}
          onReply={() => startReply(state.selectedMail)}
          onDelete={() => deleteMail(state.selectedMail.uid)}
          onArchive={() => archiveMail(state.selectedMail.uid)}
          onTag={(tag) => tagMail(state.selectedMail.uid, tag)}
          onBack={() => selectMail(null)}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("mail.title")}</h2>
        <button onClick={() => startCompose()} className="btn-primary text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" /> {t("mail.compose")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Folder sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-3 space-y-1">
            {FOLDERS.map(({ key, folder, icon: Icon }) => (
              <button
                key={folder}
                onClick={() => handleFolderChange(folder)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  activeFolder === folder
                    ? "bg-accent/10 text-accent dark:bg-accent/20 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t(`mail.folders.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Mail list */}
        <div className="lg:col-span-3">
          <div className="glass-card">
            {state.loading && (
              <div className="p-8 text-center text-muted-light dark:text-muted-dark">
                <p className="text-sm">{t("mail.loading")}</p>
              </div>
            )}

            {state.error && (
              <div className="p-8 text-center text-danger">
                <p className="text-sm">{state.error}</p>
              </div>
            )}

            {!state.loading && !state.error && state.mails.length === 0 && (
              <div className="p-8 text-center text-muted-light dark:text-muted-dark">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("mail.noMails")}</p>
              </div>
            )}

            <div className="divide-y divide-gray-200/50 dark:divide-white/5">
              {state.mails.map((mail) => (
                <div
                  key={mail.uid}
                  onClick={() => selectMail(mail)}
                  className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                    !mail.seen ? "bg-accent/[0.03]" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {!mail.seen && <div className="w-2 h-2 rounded-full bg-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${!mail.seen ? "font-semibold" : "font-medium"}`}>
                        {mail.from}
                      </span>
                      {mail.tags?.map((tag) => (
                        <span key={tag} className={`badge text-[8px] ${TAG_COLORS[tag] || ""}`}>
                          {t(`mail.tags.${tag}`)}
                        </span>
                      ))}
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${!mail.seen ? "font-medium" : ""}`}>
                      {mail.subject}
                    </p>
                    <p className="text-xs text-muted-light dark:text-muted-dark truncate mt-0.5">
                      {mail.preview}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-muted-light dark:text-muted-dark">
                      {new Date(mail.date).toLocaleDateString()}
                    </span>
                    {/* Quick actions on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); archiveMail(mail.uid); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-light hover:text-accent transition-colors"
                        title={t("mail.archive")}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMail(mail.uid); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-light hover:text-danger transition-colors"
                        title={t("mail.delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
