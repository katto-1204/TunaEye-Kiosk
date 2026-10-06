import type { HTMLAttributes, ReactNode } from 'react'

const PHONE_WIDTH = 433
const PHONE_HEIGHT = 882
const SCREEN_X = 21.25
const SCREEN_Y = 19.25
const SCREEN_WIDTH = 389.5
const SCREEN_HEIGHT = 843.5
const SCREEN_RADIUS = 55.75

const LEFT_PCT = (SCREEN_X / PHONE_WIDTH) * 100
const TOP_PCT = (SCREEN_Y / PHONE_HEIGHT) * 100
const WIDTH_PCT = (SCREEN_WIDTH / PHONE_WIDTH) * 100
const HEIGHT_PCT = (SCREEN_HEIGHT / PHONE_HEIGHT) * 100
const RADIUS_H = (SCREEN_RADIUS / SCREEN_WIDTH) * 100
const RADIUS_V = (SCREEN_RADIUS / SCREEN_HEIGHT) * 100

interface DeviceProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  videoSrc?: string
  children?: ReactNode
}

export function Device({ src, videoSrc, children, className = '', style, ...props }: DeviceProps) {
  const hasMedia = Boolean(videoSrc || src || children)
  const screenStyle = {
    left: `${LEFT_PCT}%`,
    top: `${TOP_PCT}%`,
    width: `${WIDTH_PCT}%`,
    height: `${HEIGHT_PCT}%`,
    borderRadius: `${RADIUS_H}% / ${RADIUS_V}%`,
  }

  return (
    <div className={`iphone-mockup ${className}`} style={{ aspectRatio: `${PHONE_WIDTH}/${PHONE_HEIGHT}`, ...style }} {...props}>
      {hasMedia && (
        <div className="iphone-mockup__screen" style={screenStyle}>
          {videoSrc ? (
            <video src={videoSrc} autoPlay loop muted playsInline preload="metadata" />
          ) : src ? (
            <img src={src} alt="" />
          ) : children}
        </div>
      )}

      <svg viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`} fill="none" aria-hidden="true">
        <g mask={hasMedia ? 'url(#iphone-screen-punch)' : undefined}>
          <path d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z" fill="#E5E5E5" />
          <path d="M0 171C0 170.448.448 170 1 170H3V204H1C.448 204 0 203.552 0 203V171ZM1 234C1 233.448 1.448 233 2 233H3.5V300H2C1.448 300 1 299.552 1 299V234ZM1 319C1 318.448 1.448 318 2 318H3.5V385H2C1.448 385 1 384.552 1 384V319ZM430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z" fill="#D4D4D4" />
          <path d="M6 74C6 35.34 37.34 4 76 4H356C394.66 4 426 35.34 426 74V808C426 846.66 394.66 878 356 878H76C37.34 878 6 846.66 6 808V74Z" fill="white" />
        </g>
        <path opacity=".5" d="M174 5H258V5.5C258 6.605 257.105 7.5 256 7.5H176C174.895 7.5 174 6.605 174 5.5V5Z" fill="#D4D4D4" />
        <path d={`M${SCREEN_X} 75C${SCREEN_X} 44.2101 46.2101 ${SCREEN_Y} 77 ${SCREEN_Y}H355C385.79 ${SCREEN_Y} 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 ${SCREEN_X} 837.79 ${SCREEN_X} 807V75Z`} fill="#E5E5E5" stroke="#E5E5E5" strokeWidth=".5" mask={hasMedia ? 'url(#iphone-screen-punch)' : undefined} />
        <path d="M154 48.5C154 38.283 162.283 30 172.5 30H259.5C269.717 30 278 38.283 278 48.5S269.717 67 259.5 67H172.5C162.283 67 154 58.717 154 48.5Z" fill="#F5F5F5" />
        <circle cx="259.5" cy="48.5" r="10.5" fill="#F5F5F5" />
        <circle cx="259.5" cy="48.5" r="5.5" fill="#D4D4D4" />
        <defs>
          <mask id="iphone-screen-punch" maskUnits="userSpaceOnUse">
            <rect width={PHONE_WIDTH} height={PHONE_HEIGHT} fill="white" />
            <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} rx={SCREEN_RADIUS} fill="black" />
          </mask>
        </defs>
      </svg>
    </div>
  )
}
