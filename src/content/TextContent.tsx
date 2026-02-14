import { Text } from '@react-three/drei'
import type { ContentArea } from '../data/contentArea'

type TextContentProps = {
  data: ContentArea
  isNearby: boolean
}

const TITLE_SIZE = 1.5
const DESC_SIZE = 0.8
const MAX_WIDTH = 10
const COLOR_TITLE = '#ffffff'
const COLOR_DESC = '#d4e8d0'

export function TextContent({ data, isNearby }: TextContentProps) {
  return (
    <group>
      {/* Title – laid flat on ground */}
      <Text
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={TITLE_SIZE}
        maxWidth={MAX_WIDTH}
        color={COLOR_TITLE}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {data.title}
      </Text>

      {/* Description – shown when nearby, offset behind title on ground */}
      {isNearby && (
        <Text
          position={[0, 0, 0.9]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={DESC_SIZE}
          maxWidth={MAX_WIDTH}
          color={COLOR_DESC}
          anchorX="center"
          anchorY="top"
          textAlign="center"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {data.description}
        </Text>
      )}
    </group>
  )
}
