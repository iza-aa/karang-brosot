declare module 'd3-org-chart' {
  export class OrgChart {
    container: (value: any) => this;
    data: (value: any) => this;
    nodeId: (fn: (d: any) => any) => this;
    parentNodeId: (fn: (d: any) => any) => this;
    nodeWidth: (fn: (d: any) => number) => this;
    nodeHeight: (fn: (d: any) => number) => this;
    childrenMargin: (fn: (d: any) => number) => this;
    compactMarginBetween: (fn: (d: any) => number) => this;
    compactMarginPair: (fn: (d: any) => number) => this;
    nodeContent: (fn: (d: any) => string) => this;
    render: () => this;
    fit: (args?: { animate?: boolean; nodes?: any; scale?: boolean; onCompleted?: () => void }) => this;
  }
}
