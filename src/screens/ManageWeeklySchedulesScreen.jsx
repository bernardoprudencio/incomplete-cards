import React from 'react'
import { useNavigate } from 'react-router-dom'
import { colors } from '../tokens'
import { BackIcon, ChevronRightIcon } from '../assets/icons'
import { OWNERS } from '../data/owners'
import { getOwnerRelUnit } from '../data/scheduleData'
import { peopleImages, petImages } from '../assets/images'
import { useAppContext } from '../context/AppContext'

const OWNER_PETS = {
  james: [{ id: 1, name: 'Archie', emoji: '🐕', img: petImages.archie }],
  sarah: [{ id: 1, name: 'Milo',   emoji: '🐕', img: petImages.milo   }],
  owen:  [
    { id: 1, name: 'Koni',   emoji: '🐕', img: petImages.koni   },
    { id: 2, name: 'Burley', emoji: '🐕', img: petImages.burley },
  ],
}

export default function ManageWeeklySchedulesScreen() {
  const navigate = useNavigate()
  const { ownerUnits } = useAppContext()

  const handleSelectOwner = (owner) => {
    const pets = OWNER_PETS[owner.id]
    const relUnits = [getOwnerRelUnit(owner, pets.map(p => p.id))]
    const units = ownerUnits[owner.id] ?? relUnits
    navigate(`/conversation/${owner.id}/schedule`, {
      replace: true,
      state: {
        pets,
        units,
        ownerName: owner.name,
        ownerFirstName: owner.name.split(' ')[0],
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.background.primary }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
          <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <BackIcon />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Title block */}
        <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: colors.text.primary, lineHeight: 1.25, letterSpacing: '-0.26px' }}>
            Manage weekly schedules
          </h1>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 400, color: colors.text.secondary, lineHeight: 1.5 }}>
            Select one of your active weekly customers to manage their schedule. You can add and remove services.
          </p>
        </div>

        {/* Client list */}
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.text.primary, lineHeight: 1.25 }}>
            Select a client
          </p>

          {Object.values(OWNERS).map(owner => (
            <div
              key={owner.id}
              onClick={() => handleSelectOwner(owner)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              {/* Avatar */}
              <img
                src={peopleImages[owner.id]}
                alt={owner.name}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #fff' }}
              />

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.text.primary, lineHeight: 1.5 }}>
                  {owner.name}
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 400, color: colors.text.primary, lineHeight: 1.5 }}>
                  Dog walking
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 400, color: colors.text.primary, lineHeight: 1.5 }}>
                  {owner.petNames}
                </p>
              </div>

              {/* Chevron */}
              <div style={{ flexShrink: 0 }}>
                <ChevronRightIcon />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
