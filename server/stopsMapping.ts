const stopsMapping: { [key: string]: StopsGrouping } = {
    stazione: {
        name: 'Piazza Dante (Stazione FS)',
        lastUpdatedAt: null,
        stops: [
            {
                stopId: 247,
                name: '',
                limit: 12,
                trips: [],
            },
        ],
    },
    valoni: {
        name: 'Povo (via Valoni)',
        lastUpdatedAt: null,
        stops: [
            {
                stopId: 150,
                name: '» Trento',
                trips: [],
            },
            {
                stopId: 149,
                name: '» Povo',
                trips: [],
            },
        ],
    },
    mesiano: {
        name: 'Mesiano',
        lastUpdatedAt: null,
        stops: [
            {
                stopId: 146,
                name: '» Trento',
                trips: [],
            },
            {
                stopId: 145,
                name: '» Povo',
                trips: [],
            },
        ],
    },
    mesianofs: {
        name: 'Mesiano FS',
        lastUpdatedAt: null,
        stops: [
            {
                stopId: 148,
                name: '» Trento',
                trips: [],
            },
            {
                stopId: 147,
                name: '» Povo',
                trips: [],
            },
        ],
    },
    povo1: {
        name: 'Povo (Polo Scientifico)',
        lastUpdatedAt: null,
        stops: [
            {
                stopId: 2833,
                name: '» Trento',
                trips: [],
            },
        ],
    },
};

export default stopsMapping;