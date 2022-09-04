interface StopsGrouping {
    name: string;
    lastUpdatedAt: Date | null;
    stops: Stop[];
}

interface Stop {
    stopId: number;
    name: string;
    limit?: number;
    trips: Trip[];
}