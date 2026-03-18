import React from 'react'
import { colors } from '../tokens'

const c = colors

const Icon = ({ name, size = 24, color = c.primary, style = {} }) => (
  <i
    className={`rover-icon-${name}`}
    style={{ fontSize: size, color, lineHeight: 1, display: 'inline-block', ...style }}
  />
)

export const BackIcon = () => <Icon name="in-arrow-left" />
export const BellIcon = () => <Icon name="in-bell" />
export const ChevronUpIcon = () => <Icon name="in-up" />
export const ChevronRightIcon = () => <Icon name="in-right" size={20} color={c.tertiary} />
export const EditIcon = () => <Icon name="in-edit" />
export const ClockIcon = () => <Icon name="in-clock" color="#D59418" />
export const ImageIcon = () => <Icon name="in-file-image" size={16} color={c.secondary} />
export const MapIcon = () => <Icon name="in-map-marker" size={16} />
export const CheckIcon = () => <Icon name="in-check" size={16} color={c.tertiary} />
export const HomeFilledIcon = ({ color = c.primary }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill={color}>
    <path d="M10 30v-5c0-3.552 2.448-6 6-6s6 2.448 6 6v5h6V13.568l-12-11.2-12 11.2V30h6zm2 2H2V15.435l-.318.296A1 1 0 0 1 .318 14.27L14.977.587a1.5 1.5 0 0 1 2.046 0l14.66 13.682a1 1 0 1 1-1.365 1.462L30 15.435V32H20v-7c0-2.448-1.552-4-4-4s-4 1.552-4 4v7z"/>
  </svg>
)
export const HomeOutlineIcon = ({ color = c.tertiary }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill={color}>
    <path d="M10 30v-5c0-3.552 2.448-6 6-6s6 2.448 6 6v5h6V13.568l-12-11.2-12 11.2V30h6zm2 2H2V15.435l-.318.296A1 1 0 0 1 .318 14.27L14.977.587a1.5 1.5 0 0 1 2.046 0l14.66 13.682a1 1 0 1 1-1.365 1.462L30 15.435V32H20v-7c0-2.448-1.552-4-4-4s-4 1.552-4 4v7z"/>
  </svg>
)
export const InboxIcon = ({ color = c.tertiary }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill={color}>
    <path d="M14.348 26a36.39 36.39 0 01-10.08 5.617 1.5 1.5 0 01-1.954-1.826c.705-2.437 1.217-4.582 1.537-6.43A10.977 10.977 0 010 15v-4C0 4.925 4.925 0 11 0h10c6.075 0 11 4.925 11 11v4c0 6.075-4.925 11-11 11h-6.652zm-.973-1.78l.274-.22H21a9 9 0 009-9v-4a9 9 0 00-9-9H11a9 9 0 00-9 9v4a8.982 8.982 0 003.54 7.155l.473.362-.092.588c-.286 1.82-.757 3.914-1.414 6.282a34.472 34.472 0 008.868-5.168zM8 10h8v2H8v-2zm0 4h16v2H8v-2z"/>
  </svg>
)

export const CalendarIcon = ({ color = c.tertiary }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill={color}>
    <path d="M8 0a1 1 0 0 1 1 1v5H7V1a1 1 0 0 1 1-1zm16 0a1 1 0 0 1 1 1v5h-2V1a1 1 0 0 1 1-1zM2 12v17a1 1 0 0 0 1 1h26a1 1 0 0 0 1-1V12H2zm23-2v2h5V5a1 1 0 0 0-1-1h-2V2h2a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h2v2H3a1 1 0 0 0-1 1v5h23zm-4-8v2H11V2h10z"/>
  </svg>
)

export const RebookIcon = ({ color = c.tertiary }) => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.70711 13L10.8536 15.1464C11.0488 15.3417 11.0488 15.6583 10.8536 15.8536C10.6583 16.0488 10.3417 16.0488 10.1464 15.8536L7.32322 13.0303C7.03033 12.7374 7.03033 12.2626 7.32322 11.9697L10.1464 9.14645C10.3417 8.95118 10.6583 8.95118 10.8536 9.14645C11.0488 9.34171 11.0488 9.65829 10.8536 9.85355L8.70711 12H11.5C13.433 12 15 10.433 15 8.5V7.5C15 5.567 13.433 4 11.5 4H11V3H11.5C13.9853 3 16 5.01472 16 7.5V8.5C16 10.9853 13.9853 13 11.5 13H8.70711ZM7.29289 3L5.14645 0.853553C4.95118 0.658291 4.95118 0.341709 5.14645 0.146447C5.34171 -0.0488155 5.65829 -0.0488155 5.85355 0.146447L8.67678 2.96967C8.96967 3.26256 8.96967 3.73744 8.67678 4.03033L5.85355 6.85355C5.65829 7.04882 5.34171 7.04882 5.14645 6.85355C4.95118 6.65829 4.95118 6.34171 5.14645 6.14645L7.29289 4H4.5C2.567 4 1 5.567 1 7.5V8.5C1 10.433 2.567 12 4.5 12H5V13H4.5C2.01472 13 0 10.9853 0 8.5V7.5C0 5.01472 2.01472 3 4.5 3H7.29289Z" fill={color}/>
  </svg>
)

export const MoreTabIcon = ({ color = c.tertiary }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="5" cy="12" r="1.5" fill={color}/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
    <circle cx="19" cy="12" r="1.5" fill={color}/>
  </svg>
)

export const PawIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5.5 10.5C6.5 9 9.5 9 10.5 10.5C11.5 12 10 14 8 14C6 14 4.5 12 5.5 10.5Z" stroke={c.primary} strokeWidth="1.2"/>
    <ellipse cx="4" cy="7" rx="1.5" ry="2" stroke={c.primary} strokeWidth="1.2"/>
    <ellipse cx="7" cy="5" rx="1.3" ry="1.8" stroke={c.primary} strokeWidth="1.2"/>
    <ellipse cx="9.5" cy="5" rx="1.3" ry="1.8" stroke={c.primary} strokeWidth="1.2"/>
    <ellipse cx="12" cy="7" rx="1.5" ry="2" stroke={c.primary} strokeWidth="1.2"/>
  </svg>
)

export const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="1.5" fill={c.primary}/>
    <circle cx="12" cy="12" r="1.5" fill={c.primary}/>
    <circle cx="12" cy="19" r="1.5" fill={c.primary}/>
  </svg>
)
