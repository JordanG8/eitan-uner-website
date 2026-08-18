/**
 * WhatsApp shortcut.
 *
 * Kept, because in Israel it is how clients actually make contact — but no
 * longer a #25D366 circle. That green belongs to WhatsApp's palette, not this
 * site's, and on warm paper it was the loudest object on every page. The
 * glyph is what people recognise, so the glyph is what survives; the container
 * joins the rest of the design language (square, ink, hairline).
 */
export function WhatsAppFab({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שליחת הודעה בוואטסאפ"
      className="fixed bottom-6 end-6 z-50 flex h-13 w-13 items-center justify-center bg-ink text-paper shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition-colors hover:bg-brand-700"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.2.4-.5.5-.7.2-.2.2-.4.3-.6.1-.2 0-.4 0-.5 0-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 1.7 2.7 4.2 3.8 2.5 1 2.8.9 3.3.8.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3zM12 21.8c-1.7 0-3.4-.5-4.9-1.4l-3.4.9.9-3.3A9.7 9.7 0 012.2 12 9.8 9.8 0 0112 2.2 9.8 9.8 0 0121.8 12 9.8 9.8 0 0112 21.8z" />
      </svg>
    </a>
  );
}
