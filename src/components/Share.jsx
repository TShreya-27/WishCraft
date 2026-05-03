import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import './Share.css';
import { uploadImage } from './uploadImage';

function Share({ onClose, imageSrc }) {
  // =========================================
  // STATES
  // =========================================

  const [shareUrl, setShareUrl] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // =========================================
  // QR CODE URL
  // =========================================

  const qrCodeUrl = useMemo(() => {
    if (!shareUrl) return '';

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      shareUrl
    )}`;
  }, [shareUrl]);

  // =========================================
  // DATA URL → BLOB
  // =========================================

  const dataUrlToBlob = async (dataUrl) => {
    const response = await fetch(dataUrl);
    return response.blob();
  };

  // =========================================
  // PREPARE SHARE URL
  // =========================================

  const ensureShareAssets = useCallback(async () => {
    if (!imageSrc) {
      throw new Error('No edited image available.');
    }

    // Already prepared
    if (shareUrl) {
      return {
        image: imageSrc,
        url: shareUrl,
      };
    }

    setIsPreparing(true);
    setStatusMessage('Preparing share link...');

    try {
      const url = await uploadImage(imageSrc);

      setShareUrl(url);
      setStatusMessage('Share link ready.');

      return {
        image: imageSrc,
        url,
      };
    } catch (err) {
      console.log(err);
      throw new Error(err?.message || 'Image upload failed.');
    } finally {
      setIsPreparing(false);
    }
  }, [imageSrc, shareUrl]);

  // =========================================
  // AUTO PREPARE
  // =========================================

  useEffect(() => {
    if (!imageSrc) return;

    ensureShareAssets().catch((err) => {
      setStatusMessage(
        err?.message || 'Image upload failed. Please try again.'
      );
    });
  }, [imageSrc, ensureShareAssets]);

  // =========================================
  // DOWNLOAD
  // =========================================

  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `wishcraft-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Download failed.');
    }
  };

  // =========================================
  // COPY IMAGE
  // =========================================

  const handleCopy = async () => {
    try {
      const blob = await dataUrlToBlob(imageSrc);

      const file = new File([blob], 'wishcraft.png', {
        type: 'image/png',
      });

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [file.type]: file,
          }),
        ]);

        setStatusMessage('Edited image copied.');
        return;
      }

      alert('Clipboard image copy not supported.');
    } catch (err) {
      alert('Copy failed.');
    }
  };

  // =========================================
  // WHATSAPP
  // =========================================

  const handleWhatsApp = async () => {
    try {
      const { url } = await ensureShareAssets();

      const message = encodeURIComponent(
        `Created with WishCraft\n\n${url}`
      );

      window.open(`https://wa.me/?text=${message}`, '_blank');
    } catch (err) {
      alert(err.message || 'WhatsApp sharing failed.');
    }
  };

  // =========================================
  // EMAIL
  // =========================================

  const handleEmail = async () => {
    try {
      const { url } = await ensureShareAssets();

      const subject = encodeURIComponent('Created with WishCraft');
      const body = encodeURIComponent(
        `Created with WishCraft\n\n${url}`
      );

      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (err) {
      alert(err.message || 'Email sharing failed.');
    }
  };

  // =========================================
  // INSTAGRAM
  // =========================================

  const handleInstagram = async () => {
    try {
      const { url } = await ensureShareAssets();

      await navigator.clipboard.writeText(url);

      setStatusMessage(
        'Image URL copied. Paste it in Instagram bio/story link.'
      );

      window.open('https://www.instagram.com/', '_blank');
    } catch (err) {
      alert(err.message || 'Instagram sharing failed.');
    }
  };

  // =========================================
  // NATIVE SHARE
  // =========================================

  const handleNativeShare = async () => {
    try {
      const { url } = await ensureShareAssets();

      const blob = await dataUrlToBlob(imageSrc);

      const file = new File([blob], 'wishcraft.png', {
        type: 'image/png',
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: 'WishCraft',
          text: 'Created with WishCraft',
          url,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'WishCraft',
          text: 'Created with WishCraft',
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setStatusMessage('Share URL copied.');
    } catch (err) {
      alert(err.message || 'Native share failed.');
    }
  };

  // =========================================
  // QR
  // =========================================

  const handleQR = async () => {
    try {
      await ensureShareAssets();
      setQrVisible((prev) => !prev);
    } catch (err) {
      alert(err.message || 'QR code generation failed.');
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        {/* CLOSE */}
        <button className="share-close-btn" onClick={onClose} type="button">
          ×
        </button>

        {/* TITLE */}
        <h2 className="share-title">Share Your Wish</h2>

        {/* PREVIEW */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="WishCraft"
            className="share-preview"
          />
        )}

        {/* STATUS */}
        {statusMessage && (
          <p className="share-status">{statusMessage}</p>
        )}

        {/* OPTIONS */}
        <div className="share-grid">
          {/* WHATSAPP */}
          <button
            className="share-card"
            onClick={handleWhatsApp}
            disabled={isPreparing}
            type="button"
          >
            <img
              src="/images/whatsapp.png"
              alt="WhatsApp"
              className="whatsapp-icon"
            />
            WhatsApp
          </button>

          {/* EMAIL */}
          <button
            className="share-card"
            onClick={handleEmail}
            disabled={isPreparing}
            type="button"
          >
            <img
              src="/images/email-icon.png"
              alt="Email"
              className="email-icon"
            />
            Email
          </button>

          {/* INSTAGRAM */}
          <button
            className="share-card"
            onClick={handleInstagram}
            disabled={isPreparing}
            type="button"
          >
            <img
              src="/images/insta.png"
              alt="Instagram"
              className="instagram-icon"
            />
            Instagram
          </button>

          {/* DOWNLOAD */}
          <button
            className="share-card"
            onClick={handleDownload}
            type="button"
          >
            <img
              src="/images/download-icon.png"
              alt="Download"
              className="download-icon"
            />
            Download
          </button>

          {/* COPY */}
          <button
            className="share-card"
            onClick={handleCopy}
            type="button"
          >
            <img
              src="/images/copy.png"
              alt="Copy"
              className="copy-icon"
            />
            Copy Image
          </button>

          {/* SHARE */}
          <button
            className="share-card"
            onClick={handleNativeShare}
            disabled={isPreparing}
            type="button"
          >
            <img
              src="/images/share-icon.png"
              alt="Share"
              className="share-icon"
            />
            Share
          </button>

          {/* QR */}
          <button
            className="share-card"
            onClick={handleQR}
            type="button"
          >
            <img
              src="/images/qr-icon.png"
              alt="QR Code"
              className="qr-icon"
            />
            QR Code
          </button>
        </div>

        {/* QR PANEL */}
        {qrVisible && qrCodeUrl && (
          <div className="share-qr-panel">
            <img
              src={qrCodeUrl}
              alt="QR"
              className="share-qr-image"
            />
          </div>
        )}

        {/* SHARE URL */}
        {shareUrl && (
          <div className="share-url-box">{shareUrl}
             <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-url-link"
             >
            {shareUrl}
           </a>
          </div>
        )}

        {/* FOOTER */}
        <div className="share-watermark">
          Created with <span>WishCraft</span>
        </div>
      </div>
    </div>
  );
}

export default Share;