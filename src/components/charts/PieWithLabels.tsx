// import * as d3 from 'd3-shape';
// import Svg, {G, Path, Text as SvgText} from 'react-native-svg';

// export type Slice = {name: string; value: number; color: string};

// export default function PieWithLabels({
//   data,
//   size = 240,
// }: {
//   data: Slice[];
//   size?: number;
// }) {
//   const r = size / 2;
//   const total = data.reduce((s, d) => s + d.value, 0);
//   const arcs = d3
//     .pie<Slice>()
//     .value(d => d.value)
//     .sort(null)
//     .padAngle(0.008)(data);
//   const arc = d3.arc<d3.PieArcDatum<Slice>>().outerRadius(r).innerRadius(0);

//   return (
//     <Svg width={size} height={size}>
//       <G x={r} y={r}>
//         {arcs.map((a, i) => {
//           const path = arc(a) as string;
//           const [cx, cy] = d3
//             .arc()
//             .outerRadius(r * 0.65)
//             .innerRadius(r * 0.65)
//             .centroid(a);
//           const pct = Math.round((a.data.value / total) * 100);
//           return (
//             <G key={i}>
//               <Path d={path} fill={a.data.color} />
//               <SvgText
//                 x={cx}
//                 y={cy}
//                 fontSize={pct >= 15 ? 16 : 13}
//                 fontWeight="700"
//                 fill="#FFFFFF"
//                 textAnchor="middle">
//                 {`${pct}%`}
//               </SvgText>
//             </G>
//           );
//         })}
//       </G>
//     </Svg>
//   );
// }

import React from 'react';
import * as d3 from 'd3-shape';
import type { PieArcDatum } from 'd3-shape';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

export type Slice = { name: string; value: number; color: string };

export default function PieWithLabels({
  data,
  size = 240,
}: {
  data: Slice[];
  size?: number;
}) {
  const r = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);

  const arcs: PieArcDatum<Slice>[] = d3
    .pie<Slice>()
    .value((d: Slice) => d.value)
    .sort(null)
    .padAngle(0.008)(data);

  const arc = d3.arc<PieArcDatum<Slice>>().outerRadius(r).innerRadius(0);
  const labelArc = d3
    .arc<PieArcDatum<Slice>>()
    .outerRadius(r * 0.65)
    .innerRadius(r * 0.65);

  return (
    <Svg width={size} height={size}>
      <G x={r} y={r}>
        {arcs.map((a: PieArcDatum<Slice>, i: number) => {
          const path = arc(a) ?? ''; // arc(a) có thể null
          const [cx, cy] = (labelArc.centroid(a) as [number, number]) ?? [0, 0];
          const pct = total > 0 ? Math.round((a.data.value / total) * 100) : 0;

          return (
            <G key={`${a.data.name}-${i}`}>
              <Path d={path} fill={a.data.color} />
              <SvgText
                x={cx}
                y={cy}
                fontSize={pct >= 15 ? 16 : 13}
                fontWeight="700"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                {`${pct}%`}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}
