import Beams from './Beams'

export default function Background() {
  return (
    <div className="background-layer">
      <div className="beams-tilt">
        <Beams
          speed={0.35}
          density={0.8}
          opacity={0.18}
          enableMouse={false}
        />
      </div>
    </div>
  )
}
