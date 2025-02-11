<script setup lang="ts">
import { onMounted, onUnmounted, ref, useHead, useLazyFetch, useRoute, watch } from '#imports';
import Trip from '@/components/Trip.vue';
import Switch from '~/components/Switch.vue';
import FooterNavigation from '~/components/FooterNavigation.vue';

enum ResponseError {
    NotFound = 1,
    NotMyFault = 2,
    Unknown = 3,
}

/* State */
let stopSlug: string;
let stopFullPath: string;
let stopDetail: LocationQuery;
const isLoading = ref(true);
let data = ref<StopResponse | null>(null);
let stopName = ref('');
let trainSlug = ref<string | null>(null);
let error = ref<ResponseError | null>(null);
let refreshData: Function;
let timer: NodeJS.Timer;

/* Methods */
function readStopSlug() {
    const route = useRoute();
    stopSlug = route.params.stop  as string;
    stopFullPath = route.fullPath as string;
    console.log(stopSlug)
    console.log(stopFullPath)
}

async function loadStop() {
    let response = useLazyFetch<StopResponse>(() => `/api/stops${stopFullPath}`);

    refreshData = response.refresh;

    watch(response.error, () => {
        if (response.error.value) {
            isLoading.value = false;
            error.value = ResponseError.Unknown;

            if (response.error.value instanceof Error) {
                let err: any = response.error.value;
                if (err.response) {
                    if (err.response.status === 404) {
                        error.value = ResponseError.NotFound;
                    } else if (err.response.status === 503) {
                        error.value = ResponseError.NotMyFault;
                    }

                    if (error.value != ResponseError.NotFound) {
                        loadStopInfo();
                    }
                }
            }
        } else {
            isLoading.value = false;
            error.value = null;
        }
    });

    watch(response.data, () => {
        data.value = response.data.value;

        if (data.value) {
            useHead({
                title: data.value.stopName,
            });

            stopName.value = data.value.stopName;
            trainSlug.value = data.value.trainSlug;

            // Initial loading finished
            if (isLoading.value) {
                isLoading.value = false;
                // Start refresh timer
                timer = startRefreshTimer();
            }
        }
    });
}

async function loadStopInfo() {
    let response = useLazyFetch<StopInfoResponse>(() => `/api/stops${stopSlug}/info`);

    watch(response.data, () => {
        if (response.data.value) {
            stopName.value = response.data.value.stopName;
            trainSlug.value = response.data.value.trainSlug;
            useHead({
                title: stopName.value,
            });
        }
    });
}

async function requestRefresh() {
    console.log('Refreshing...');
    await refreshData();
}

function startRefreshTimer(milliseconds = 30 * 1000) {
    return setInterval(requestRefresh, milliseconds);
}

async function onVisibilityChange() {
    if (document.visibilityState == 'hidden') {
        clearInterval(timer);
    } else if (error.value != ResponseError.NotFound) {
        timer = startRefreshTimer();
        await requestRefresh();
    }
}

/* Lifecycle */
onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);
});

onUnmounted(() => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
});

readStopSlug();
await loadStop();
</script>

<template>
    <div>
        <header>
            <h1 v-if="stopName" class="font-semibold text-center text-4xl">{{ stopName }}</h1>
            <div v-if="data && data.lastUpdatedAt" class="mt-1 text-sm text-center">
                aggiornato alle
                {{
                    new Date(data.lastUpdatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                }}
            </div>
            <div v-if="data" class="mt-1 text-sm text-center">
                <a :href =  "`https://www.google.com/maps/place/${data.coordinates}`">📍 GoogleMaps </a>
            </div>
            
            <Switch v-if="trainSlug" class="mt-6" :is-bus="true" :bus-slug="stopSlug" :train-slug="trainSlug" />
        </header>

        <div v-if="isLoading" class="text-center">Caricamento...</div>

        <div v-else-if="error" class="text-center mt-12">
            <div class="text-red-500">
                <template v-if="error === ResponseError.NotFound">
                    <p>Fermata non trovata</p>
                    <p>
                        Puoi chiedere che venga aggiunta
                        <a :href="`mailto:info@traquantopassa.in?subject=Richiesta fermata /${stopSlug}`">via email</a>.
                    </p>
                </template>
                <template v-else-if="error === ResponseError.NotMyFault">
                    <p>I dati di Trentino Trasporti non sono al momento disponibili 😕</p>
                    <p>Prova a ricaricare la pagina.</p>
                </template>
                <template v-else>
                    <p>Si è verificato un errore 😕</p>
                    <p>Prova a ricaricare la pagina. Se il problema persiste, contattaci.</p>
                </template>
            </div>

            <FooterNavigation class="my-12" />
        </div>

        <template v-else-if="data">
            <main>
                <div v-for="(direction,index) in data.directions" class="mt-10">
                    <div class="w-fit mx-auto text-lg uppercase font-medium mb-4 text-center">
                        {{ direction.name }}
                    </div>
                    <Trip v-for="trip in direction.trips" :trip="trip" />

                    <div v-if="direction.detailAvailable" class="mt-1 text-sm text-center">
                        <br>
                        <a :href =  "`/${stopSlug}?d=${index+1}`">Mostra ancora..</a>
                    </div>

                    <div v-if="direction.trips.length === 0" class="text-center">Nessun autobus previsto per oggi</div>
                </div>
            </main>

            <footer class="my-12">
                <div class="text-sm text-neutral-500">
                    <div>
                        Il pallino verde
                        <span class="inline-block rounded-full w-2 h-2 animate-ping bg-green-500 mr-1 mx-0.5"></span>
                        indica che i dati sono in tempo reale.
                    </div>

                    <div class="mt-2">
                        Il pallino è giallo
                        <span class="inline-block rounded-full w-2 h-2 animate-ping bg-yellow-500 mr-1 mx-0.5"></span>
                        se l'autobus non ha trasmesso aggiornamenti negli ultimi 5 minuti.
                    </div>

                    <div class="mt-2">La pagina si aggiorna automaticamente ogni 30 secondi.</div>
                </div>

                <FooterNavigation class="mt-6" />
            </footer>
        </template>
    </div>
</template>
