import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './editor.css';
import Share from './Share';
import Cropper from 'react-easy-crop';

function getStoredProfile() {
  const type = localStorage.getItem('wishcraft_profile_type');

  if (!type) return null;

  return {
    type,
    name: localStorage.getItem('wishcraft_profile_name') || 'User',
    picture:
      localStorage.getItem(
        'wishcraft_profile_picture'
      ) || '',
  };
}

const tools = [
  { key: 'crop', label: 'Crop', icon: '✂' },
  { key: 'browse', label: 'Browse', icon: '⌕' },
  { key: 'add-text', label: 'Add Text', icon: 'T' },
];

const cropAspectPresets = [
  { label: 'Free', value: null },
  { label: 'Square', value: 1 },
  { label: 'Portrait', value: 4 / 5 },
  { label: 'Landscape', value: 16 / 9 },
  { label: 'Story', value: 9 / 16 },
];

const getRadianAngle = (degreeValue) =>
  (degreeValue * Math.PI) / 180;

const getRotatedSize = (width, height, rotation = 0) => {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) +
      Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) +
      Math.abs(Math.cos(rotRad) * height),
  };
};

function Editor({ onSignOut, profile: profileProp }) {
  const profile = useMemo(
    () => profileProp || getStoredProfile(),
    [profileProp]
  );

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const hasInjectedDefaults = useRef(false);

  const [showTools, setShowTools] =
    useState(true);

  const [showShare, setShowShare] =
    useState(false);

  const [showCrop, setShowCrop] =
    useState(false);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [cropAspect, setCropAspect] =
    useState(4 / 5);

  const [cropRotation, setCropRotation] =
    useState(0);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState(null);

  const [importImage, setImportImage] =
    useState(
      () =>
        localStorage.getItem(
          'selectedTemplate'
        ) || ''
    );

  const [templateLoaded, setTemplateLoaded] =
    useState(false);

  const [canvasSize, setCanvasSize] =
    useState({
      width: 0,
      height: 0,
    });

  const [elements, setElements] = useState([]);

  const [selectedElementId, setSelectedElementId] =
    useState(null);

  const [cursorPosition, setCursorPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [shareImage, setShareImage] =
    useState('');

  const activeCropPreset =
    cropAspectPresets.find(
      (preset) =>
        preset.value === cropAspect
    ) || cropAspectPresets[0];

  const selectedElement =
    elements.find(
      (el) => el.id === selectedElementId
    ) || null;

  // =========================
  // TEMPLATE LOAD
  // =========================

  useEffect(() => {
    const storedImage =
      localStorage.getItem(
        'selectedTemplate'
      );

    if (storedImage) {
      setImportImage(storedImage);
    }
  }, []);

  useEffect(() => {
    if (importImage) {
      setTemplateLoaded(true);
    }
  }, [importImage]);

  const syncCanvasSize = useCallback(() => {
    const canvasEl = canvasRef.current;

    if (!canvasEl) return;

    const nextSize = {
      width: Math.round(canvasEl.clientWidth),
      height: Math.round(canvasEl.clientHeight),
    };

    if (!nextSize.width || !nextSize.height) {
      return;
    }

    setCanvasSize((prev) =>
      prev.width === nextSize.width &&
      prev.height === nextSize.height
        ? prev
        : nextSize
    );
  }, []);

  useEffect(() => {
    if (!importImage) return undefined;

    syncCanvasSize();

    window.addEventListener(
      'resize',
      syncCanvasSize
    );

    return () =>
      window.removeEventListener(
        'resize',
        syncCanvasSize
      );
  }, [importImage, syncCanvasSize]);

  // =========================
  // AUTO USER OVERLAY
  // =========================
  useEffect(() => {
  if (!templateLoaded) return;

  if (!canvasSize.width) return;

  if (hasInjectedDefaults.current) return;

  hasInjectedDefaults.current = true;

  const canvasWidth = canvasSize.width;

  const defaultElements = [];

  // =========================
  // PROFILE SETTINGS
  // =========================

  const profileSize =
    Math.max(
      74,
      Math.min(120, canvasWidth * 0.24)
    );

  const profileX =
    Math.max(16, canvasWidth * 0.04);

  const nameBarHeight =
    Math.max(
      76,
      Math.min(120, canvasWidth * 0.25)
    );

  const profileY =
    Math.max(42, nameBarHeight * 0.48);

  // =========================
  // NAME SETTINGS
  // =========================

  const userName =
    profile?.name || 'User';

  const nameBarX = 0;

  const nameBarY = 0;

  const nameFontSize =
    Math.max(
      28,
      Math.min(42, canvasWidth * 0.085)
    );

  // =========================
  // HEADER BAR
  // =========================

  defaultElements.push({
    id: 'header-bar',

    type: 'shape',

    x: nameBarX,

    y: nameBarY,

    width: canvasWidth,

    height: nameBarHeight,

    backgroundColor: '#2b1f1a',

    borderRadius: 0,
  });

  // =========================
  // USER NAME
  // =========================

  defaultElements.push({
    id: `name-${Date.now()}`,

    type: 'text',

    role: 'user-name',

    text: userName,

    x: nameBarX,

    y: nameBarY,

    width: canvasWidth,

    height: nameBarHeight,

    color: '#f5f5f5',

    fontSize: nameFontSize,

    fontWeight: 600,

    fontFamily: 'Poppins',

    textAlign: 'center',

    alignItems: 'center',

    paddingX: Math.max(18, canvasWidth * 0.08),
  });

  // =========================
  // PROFILE IMAGE
  // =========================

  if (profile?.picture) {
    defaultElements.push({
      id: `photo-${Date.now()}`,

      type: 'image',

      src: profile.picture,

      x: profileX,

      y: profileY,

      width: profileSize,

      height: profileSize,

      borderRadius: '50%',

      border: '6px solid #0cc76f',

      boxShadow:
        '0 8px 18px rgba(0,0,0,0.25)',
    });
  }

  setElements(defaultElements);
}, [templateLoaded, profile, canvasSize.width]);

  useEffect(() => {
    if (
      !canvasSize.width ||
      !hasInjectedDefaults.current
    ) {
      return;
    }

    const nameBarHeight =
      Math.max(
        76,
        Math.min(120, canvasSize.width * 0.25)
      );

    const nameFontSize =
      Math.max(
        28,
        Math.min(42, canvasSize.width * 0.085)
      );

    setElements((prev) =>
      prev.map((item) => {
        if (item.id === 'header-bar') {
          return {
            ...item,
            x: 0,
            y: 0,
            width: canvasSize.width,
            height: nameBarHeight,
          };
        }

        if (item.role === 'user-name') {
          return {
            ...item,
            x: 0,
            y: 0,
            width: canvasSize.width,
            height: nameBarHeight,
            fontSize: nameFontSize,
            paddingX: Math.max(
              18,
              canvasSize.width * 0.08
            ),
          };
        }

        return item;
      })
    );
  }, [canvasSize.width]);
  // =========================
  // CURSOR
  // =========================

  useEffect(() => {
    const moveCursor = (e) => {
      setCursorPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener(
      'mousemove',
      moveCursor
    );

    return () =>
      window.removeEventListener(
        'mousemove',
        moveCursor
      );
  }, []);

  // =========================
  // IMAGE HELPERS
  // =========================

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();

      image.crossOrigin = 'anonymous';

      image.onload = () =>
        resolve(image);

      image.onerror = reject;

      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc,
    pixelCrop,
    rotation = 0
  ) => {
    const image =
      await createImage(imageSrc);

    const rotRad =
      getRadianAngle(rotation);

    const { width: bBoxWidth, height: bBoxHeight } =
      getRotatedSize(
        image.width,
        image.height,
        rotation
      );

    const canvas =
      document.createElement('canvas');

    const ctx =
      canvas.getContext('2d');

    canvas.width = bBoxWidth;

    canvas.height = bBoxHeight;

    ctx.translate(
      bBoxWidth / 2,
      bBoxHeight / 2
    );

    ctx.rotate(rotRad);

    ctx.translate(
      -image.width / 2,
      -image.height / 2
    );

    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height
    );

    const croppedCanvas =
      document.createElement('canvas');

    const croppedCtx =
      croppedCanvas.getContext('2d');

    croppedCanvas.width =
      pixelCrop.width;

    croppedCanvas.height =
      pixelCrop.height;

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return croppedCanvas.toDataURL(
      'image/png'
    );
  };

  const getWrappedLines = (
    ctx,
    text,
    maxWidth
  ) => {
    if (!maxWidth) return [text];

    const words = text.split(' ');

    const lines = [];

    let line = '';

    const splitLongWord = (word) => {
      const parts = [];

      let part = '';

      word.split('').forEach((letter) => {
        const testPart = `${part}${letter}`;

        if (
          ctx.measureText(testPart).width >
            maxWidth &&
          part
        ) {
          parts.push(part);
          part = letter;
        } else {
          part = testPart;
        }
      });

      if (part) {
        parts.push(part);
      }

      return parts;
    };

    words.forEach((word) => {
      if (
        ctx.measureText(word).width >
        maxWidth
      ) {
        if (line) {
          lines.push(line);
          line = '';
        }

        lines.push(...splitLongWord(word));
        return;
      }

      const testLine =
        line ? `${line} ${word}` : word;

      if (
        ctx.measureText(testLine).width >
          maxWidth &&
        line
      ) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      lines.push(line);
    }

    return lines;
  };

  const drawTextElement = (
    ctx,
    item
  ) => {
    ctx.font = `${item.fontWeight || 600} ${item.fontSize}px ${
      item.fontFamily || 'Poppins'
    }`;

    ctx.fillStyle =
      item.color || '#ffffff';

    ctx.textAlign =
      item.textAlign || 'left';

    ctx.textBaseline = 'middle';

    const paddingX =
      item.paddingX || 0;

    const maxWidth =
      item.width
        ? item.width - paddingX * 2
        : 0;

    const lines =
      getWrappedLines(
        ctx,
        item.text,
        maxWidth
      );

    const lineHeight =
      item.fontSize * 1.18;

    const blockHeight =
      lines.length * lineHeight;

    const startY =
      item.height
        ? item.y +
          item.height / 2 -
          blockHeight / 2 +
          lineHeight / 2
        : item.y + item.fontSize;

    const x =
      item.textAlign === 'center' &&
      item.width
        ? item.x + item.width / 2
        : item.x + paddingX;

    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        x,
        startY + index * lineHeight,
        maxWidth || undefined
      );
    });
  };

  const onCropComplete = (
    _,
    croppedAreaPixelsValue
  ) => {
    setCroppedAreaPixels(
      croppedAreaPixelsValue
    );
  };

  // =========================
  // DRAGGING
  // =========================

  const startDragElement = (
    e,
    id
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const canvasEl =
      canvasRef.current;

    if (!canvasEl) return;

    const rect =
      canvasEl.getBoundingClientRect();

    const element =
      elements.find(
        (el) => el.id === id
      );

    if (!element) return;

    dragRef.current = {
      id,

      offsetX:
        e.clientX -
        rect.left -
        element.x,

      offsetY:
        e.clientY -
        rect.top -
        element.y,
    };

    setSelectedElementId(id);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;

      const canvasEl =
        canvasRef.current;

      if (!canvasEl) return;

      const rect =
        canvasEl.getBoundingClientRect();

      setElements((prev) =>
        prev.map((item) =>
          item.id === dragRef.current.id
            ? {
                ...item,

                x:
                  e.clientX -
                  rect.left -
                  dragRef.current
                    .offsetX,

                y:
                  e.clientY -
                  rect.top -
                  dragRef.current
                    .offsetY,
              }
            : item
        )
      );
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener(
      'mousemove',
      onMove
    );

    window.addEventListener(
      'mouseup',
      onUp
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        onMove
      );

      window.removeEventListener(
        'mouseup',
        onUp
      );
    };
  }, []);

  // =========================
  // TEXT
  // =========================

  const addText = () => {
    const userText = prompt(
      'Enter your text'
    );

    if (!userText) return;

    const id = Date.now();

    setElements((prev) => [
      ...prev,

      {
        id,

        type: 'text',

        text: userText,

        x: 220,
        y: 220,

        color: '#ffffff',

        fontSize: 32,

        fontWeight: 700,

        fontFamily: 'Poppins',
      },
    ]);

    setSelectedElementId(id);
  };

  const updateSelectedElement = (
    updates
  ) => {
    if (!selectedElementId) return;

    setElements((prev) =>
      prev.map((item) =>
        item.id === selectedElementId
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );
  };

  // =========================
  // BROWSE
  // =========================

  const handleBrowseTemplates = () => {
    window.location.href =
      '/browse';
  };

  // =========================
  // CLEAR
  // =========================

  const clearImportedImage = () => {
    localStorage.removeItem(
      'selectedTemplate'
    );

    setImportImage('');

    setElements([]);

    setSelectedElementId(null);

    hasInjectedDefaults.current =
      false;
  };

  // =========================
  // CROP
  // =========================

  const handleCropApply =
    async () => {
      if (
        !croppedAreaPixels ||
        !importImage
      ) {
        setShowCrop(false);
        return;
      }

      const croppedImage =
        await getCroppedImg(
          importImage,
          croppedAreaPixels,
          cropRotation
        );

      setImportImage(croppedImage);

      setCrop({ x: 0, y: 0 });

      setZoom(1);

      setCropRotation(0);

      setCroppedAreaPixels(null);

      setShowCrop(false);
    };

  // =========================
  // SHARE
  // =========================

  const handleShare =
    async () => {
      if (!importImage) {
        setShowShare(true);
        return;
      }

      const canvasEl =
        canvasRef.current;

      const width =
        canvasEl?.clientWidth ||
        900;

      const height =
        canvasEl?.clientHeight ||
        560;

      const exportCanvas =
        document.createElement(
          'canvas'
        );

      exportCanvas.width = width;

      exportCanvas.height =
        height;

      const ctx =
        exportCanvas.getContext(
          '2d'
        );

      const base =
        await createImage(
          importImage
        );

      ctx.drawImage(
        base,
        0,
        0,
        width,
        height
      );

      for (const item of elements) {
        // TEXT

        if (item.type === 'text') {
          drawTextElement(ctx, item);
        }

        // IMAGE

        if (item.type === 'image') {
          const img =
            await createImage(
              item.src
            );

          ctx.save();

          ctx.beginPath();

          ctx.arc(
            item.x +
              item.width / 2,
            item.y +
              item.height / 2,
            item.width / 2,
            0,
            Math.PI * 2
          );

          ctx.clip();

          ctx.drawImage(
            img,
            item.x,
            item.y,
            item.width,
            item.height
          );

          ctx.restore();

          ctx.lineWidth = 6;

          ctx.strokeStyle =
            '#0cc76f';

          ctx.beginPath();

          ctx.arc(
            item.x +
              item.width / 2,
            item.y +
              item.height / 2,
            item.width / 2,
            0,
            Math.PI * 2
          );

          ctx.stroke();
        }

        // SHAPE

        if (item.type === 'shape') {
          ctx.fillStyle =
            item.backgroundColor;

          ctx.fillRect(
            item.x,
            item.y,
            item.width,
            item.height
          );
        }
      }

      setShareImage(
        exportCanvas.toDataURL(
          'image/png'
        )
      );

      setShowShare(true);
    };

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <div className="editor-topbar-title">
          Hi!{' '}
          {profile?.name ||
            'User'}{' '}
          , This is Your Canvas
        </div>

        <div className="editor-topbar-actions">
          <button
            type="button"
            className="editor-share"
            onClick={handleShare}
          >
            Share
          </button>

          {onSignOut ? (
            <button
              type="button"
              className="editor-signout"
              onClick={
                onSignOut
              }
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>

      <div className="editor-body">
        <aside className="editor-sidebar-column">
          <button
            type="button"
            className="editor-toolkit-header"
            onClick={() =>
              setShowTools(
                (prev) => !prev
              )
            }
          >
            ☰ Tool Kit
          </button>

          {showTools && (
            <div className="editor-sidebar">
              {tools.map(
                (tool) => (
                  <button
                    key={
                      tool.key
                    }
                    className="editor-tool"
                    onClick={() => {
                      if (
                        tool.key ===
                        'add-text'
                      ) {
                        addText();
                      }

                      if (
                        tool.key ===
                        'browse'
                      ) {
                        handleBrowseTemplates();
                      }

                      if (
                        tool.key ===
                        'crop'
                      ) {
                        if (
                          importImage
                        ) {
                          setShowCrop(
                            true
                          );
                        }
                      }
                    }}
                  >
                    {
                      tool.label
                    }
                  </button>
                )
              )}

              {selectedElement?.type ===
                'text' && (
                <div className="text-controls">
                  <label>
                    <button class="editor-tool">Font Size</button>
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="100"
                    value={
                      selectedElement.fontSize
                    }
                    onChange={(e) =>
                      updateSelectedElement(
                        {
                          fontSize:
                            Number(
                              e.target.value
                            ),
                        }
                      )
                    }
                  />

                  <label>
                    <button class="editor-tool">Text Color</button>
                  </label>

                  <input
                    type="color"
                    value={
                      selectedElement.color
                    }
                    onChange={(
                      e
                    ) =>
                      updateSelectedElement({
                          color:e.target.value,
                        })
                    }
                    className="editor-color-picker"
                  />
                </div>
              )}
                  <button
                  type="button"
                  className="editor-tool"
                  onClick={() => {
                    window.location.href = '/dashboard';
                    }}
                    >
                    Dashboard
                  </button>
            </div>
          )}
        </aside>

        <main className="editor-canvas-area">
          {!importImage ? (
            <div className="editor-start-actions">
              <button
                type="button"
                className="editor-action-btn"
                onClick={
                  handleBrowseTemplates
                }
              >
                Browse
                Templates
              </button>
            </div>
          ) : (
            <div
              className="editor-live-canvas"
            >
              <div
                className="editor-image-frame"
                ref={canvasRef}
              >
                <img
                  src={importImage}
                  alt="Template"
                  className="editor-template-image"
                  onLoad={syncCanvasSize}
                />

                {elements.map(
                  (item) => {
                  // TEXT

                    if (
                      item.type ===
                      'text'
                    ) {
                      return (
                        <div
                          key={
                            item.id
                          }
                          className={`editor-text-layer ${
                            selectedElementId ===
                            item.id
                              ? 'selected'
                              : ''
                          }`}
                          style={{
                            position:
                              'absolute',

                            left:
                              item.x,

                            top:
                              item.y,

                            transform:
                              item.textAlign ===
                              'center' &&
                              !item.width
                                ? 'translateX(-50%)'
                                : 'none',

                            color:
                              item.color,

                            fontSize:
                              item.fontSize,

                            fontWeight:
                              item.fontWeight,

                            fontFamily:
                              item.fontFamily,

                            width:
                              item.width,

                            minHeight:
                              item.height,

                            padding:
                              item.paddingX
                                ? `0 ${item.paddingX}px`
                                : undefined,

                            boxSizing:
                              'border-box',

                            display:
                              item.height
                                ? 'flex'
                                : undefined,

                            alignItems:
                              item.alignItems ||
                              undefined,

                            justifyContent:
                              item.textAlign ===
                              'center'
                                ? 'center'
                                : undefined,

                            overflowWrap:
                              'break-word',

                            whiteSpace:
                              item.whiteSpace ||
                              'normal',

                            lineHeight:
                              1.15,

                            textAlign:
                              item.textAlign ||
                              'left',

                            zIndex: 5,
                          }}
                          onMouseDown={(
                            e
                          ) =>
                            startDragElement(
                              e,
                              item.id
                            )
                          }
                        >
                          {
                            item.text
                          }
                        </div>
                      );
                    }

                  // IMAGE

                    if (
                      item.type ===
                      'image'
                    ) {
                      return (
                        <img
                          key={
                            item.id
                          }
                          src={
                            item.src
                          }
                          alt=""
                          className={`editor-user-photo ${
                            selectedElementId ===
                            item.id
                              ? 'selected'
                              : ''
                          }`}
                          style={{
                            position:
                              'absolute',

                            left:
                              item.x,

                            top:
                              item.y,

                            width:
                              item.width,

                            height:
                              item.height,

                            borderRadius:
                              item.borderRadius,

                            border:
                              item.border,

                            boxShadow:
                              item.boxShadow,

                            objectFit:
                              'cover',

                            zIndex: 10,
                          }}
                          onMouseDown={(
                            e
                          ) =>
                            startDragElement(
                              e,
                              item.id
                            )
                          }
                        />
                      );
                    }

                  // SHAPE

                    if (
                      item.type ===
                      'shape'
                    ) {
                      return (
                        <div
                          key={
                            item.id
                          }
                          style={{
                            position:
                              'absolute',

                            left:
                              item.x,

                            top:
                              item.y,

                            width:
                              item.width,

                            height:
                              item.height,

                            background: item.backgroundColor,
                            borderRadius: item.borderRadius || 0,

                            zIndex: 1,
                          }}
                        />
                      );
                    }

                    return null;
                  }
                )}
              </div>

              <div className="editor-import-actions">
                <button
                  type="button"
                  className="editor-import-btn"
                  onClick={
                    clearImportedImage
                  }
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {profile?.picture && (
        <img
          src={profile.picture}
          alt=""
          className="editor-cursor-profile"
          style={{
            left:
              cursorPosition.x,
            top:
              cursorPosition.y,
          }}
        />
      )}

      {showShare ? (
        <Share
          onClose={() =>
            setShowShare(false)
          }
          imageSrc={shareImage}
        />
      ) : null}

      {showCrop ? (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <h2 className="crop-title">
              Crop Image
            </h2>

            <div className="cropper-wrapper">
              <Cropper
                image={
                  importImage
                }
                crop={crop}
                zoom={zoom}
                rotation={cropRotation}
                aspect={
                  cropAspect ||
                  undefined
                }
                onCropChange={
                  setCrop
                }
                onZoomChange={
                  setZoom
                }
                onRotationChange={
                  setCropRotation
                }
                onCropComplete={
                  onCropComplete
                }
              />
            </div>

            <div className="crop-controls">
              <div className="crop-control-group">
                <div className="crop-control-label">
                  Aspect Ratio
                </div>

                <div className="crop-preset-row">
                  {cropAspectPresets.map(
                    (preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className={`crop-preset-btn ${
                          activeCropPreset.label ===
                          preset.label
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setCropAspect(
                            preset.value
                          )
                        }
                      >
                        {preset.label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <label className="crop-slider">
                Zoom
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) =>
                    setZoom(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </label>

              <label className="crop-slider">
                Rotate
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={cropRotation}
                  onChange={(e) =>
                    setCropRotation(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="crop-reset"
                onClick={() => {
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCropRotation(0);
                  setCropAspect(4 / 5);
                }}
              >
                Reset Crop
              </button>
            </div>

            <div className="crop-actions">
              <button
                type="button"
                className="crop-cancel"
                onClick={() =>
                  setShowCrop(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="crop-apply"
                onClick={
                  handleCropApply
                }
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Editor;
