// DOM Elements
const barsContainer = document.getElementById('bars-container');
const generateArrayBtn = document.getElementById('generate-array');
const sizeSlider = document.getElementById('array-size');
const speedSlider = document.getElementById('speed-slider');
const sizeValue = document.getElementById('size-value');
const speedValue = document.getElementById('speed-value');

// Sorting Buttons
const bubbleBtn = document.getElementById('bubble-sort');
const mergeBtn = document.getElementById('merge-sort');
const quickBtn = document.getElementById('quick-sort');

// Info Section Elements
const infoContent = document.getElementById('info-content');
const algoName = document.getElementById('algo-name');
const javaCode = document.getElementById('java-code');
const timeBest = document.getElementById('time-best');
const timeAvg = document.getElementById('time-avg');
const timeWorst = document.getElementById('time-worst');
const spaceComp = document.getElementById('space-comp');
const algoExplanation = document.getElementById('algo-explanation');

// State variables
let array = [];
let isSorting = false;
let abortController = null;

// Colors
const COLOR_DEFAULT = 'var(--bar-default)';
const COLOR_COMPARE = 'var(--bar-compare)';
const COLOR_SWAP = 'var(--bar-swap)';
const COLOR_SORTED = 'var(--bar-sorted)';

// Algorithm Information Details
const algoData = {
    bubble: {
        name: "Bubble Sort",
        code: `public static void bubbleSort(int arr[]) {\n    int n = arr.length;\n    for(int i=0; i<n-1; i++) {\n        for(int j=0; j<n-i-1; j++) {\n            if(arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`,
        time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
        space: "O(1)",
        explanation: "Bubble Sort is a simple comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. It is easy to understand but very inefficient for large datasets."
    },
    merge: {
        name: "Merge Sort",
        code: `public static void mergeSort(int[] arr, int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}\n\n// merge() function merges two sorted halves`,
        time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" },
        space: "O(n)",
        explanation: "Merge Sort is a divide-and-conquer algorithm. It divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves. It is highly efficient and guarantees a worst-case time complexity of O(n log n), but requires extra space proportional to the array size."
    },
    quick: {
        name: "Quick Sort",
        code: `public static void quickSort(int[] arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n\n// partition() function places pivot at correct position`,
        time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
        space: "O(log n)",
        explanation: "Quick Sort is a divide-and-conquer algorithm that selects a 'pivot' element and partitions the other elements into two sub-arrays, according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively. It is extremely fast in practice but can degrade to O(n²) if poorly implemented or given already sorted data."
    }
};

// Initialization
function init() {
    generateArray();
    setupEventListeners();
}

function updateInfoSection(algoKey) {
    const data = algoData[algoKey];
    algoName.textContent = data.name;
    javaCode.textContent = data.code;
    timeBest.textContent = data.time.best;
    timeAvg.textContent = data.time.avg;
    timeWorst.textContent = data.time.worst;
    spaceComp.textContent = data.space;
    algoExplanation.textContent = data.explanation;
    infoContent.style.display = 'grid';
}

function setupEventListeners() {
    generateArrayBtn.addEventListener('click', () => {
        if (!isSorting) generateArray();
    });

    sizeSlider.addEventListener('input', () => {
        sizeValue.textContent = sizeSlider.value;
        if (!isSorting) generateArray();
    });

    speedSlider.addEventListener('input', () => {
        const val = parseInt(speedSlider.value);
        let text = "Medium";
        if (val < 33) text = "Slow";
        else if (val > 66) text = "Fast";
        speedValue.textContent = text;
    });

    bubbleBtn.addEventListener('click', () => startSort('bubble'));
    mergeBtn.addEventListener('click', () => startSort('merge'));
    quickBtn.addEventListener('click', () => startSort('quick'));
}

function generateArray() {
    barsContainer.innerHTML = '';
    array = [];
    const size = parseInt(sizeSlider.value);

    // Width of bars depends on container size and number of elements
    const barWidth = Math.max(2, Math.floor(800 / size) - 1);

    for (let i = 0; i < size; i++) {
        // Random value between 5 and 100 for percentage height
        const value = Math.floor(Math.random() * 95) + 5;
        array.push(value);

        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value}%`;
        bar.style.width = `${barWidth}px`;
        barsContainer.appendChild(bar);
    }
}

// Disable/Enable UI during sorting
function toggleUI(disabled) {
    generateArrayBtn.disabled = disabled;
    sizeSlider.disabled = disabled;
    bubbleBtn.disabled = disabled;
    mergeBtn.disabled = disabled;
    quickBtn.disabled = disabled;

    if (disabled) {
        document.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('active'));
    }
}

// Calculate delay based on speed slider
function getDelay() {
    const speed = parseInt(speedSlider.value);
    // 1 (slow) -> 200ms, 100 (fast) -> 2ms
    return Math.floor(200 - (speed * 1.98));
}

// Async delay function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to update bar height and UI
function setBarHeight(index, heightPercent) {
    const bars = document.getElementsByClassName('bar');
    bars[index].style.height = `${heightPercent}%`;
}

function setBarColor(index, color) {
    const bars = document.getElementsByClassName('bar');
    if (bars[index]) {
        bars[index].style.backgroundColor = color;
    }
}

async function markAllSorted() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < bars.length; i++) {
        setBarColor(i, COLOR_SORTED);
        await sleep(10);
    }
}

// Entry point for starting a sort
async function startSort(algo) {
    if (isSorting) return;

    isSorting = true;
    toggleUI(true);
    document.getElementById(`${algo}-sort`).classList.add('active');
    updateInfoSection(algo);

    try {
        if (algo === 'bubble') {
            await bubbleSort();
        } else if (algo === 'merge') {
            await mergeSort(0, array.length - 1);
        } else if (algo === 'quick') {
            await quickSort(0, array.length - 1);
        }
        await markAllSorted();
    } catch (e) {
        console.error("Sorting interrupted or failed:", e);
    } finally {
        isSorting = false;
        toggleUI(false);
    }
}

/* --- Algorithms --- */

// 1. Bubble Sort
async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            setBarColor(j, COLOR_COMPARE);
            setBarColor(j + 1, COLOR_COMPARE);
            await sleep(getDelay());

            if (array[j] > array[j + 1]) {
                setBarColor(j, COLOR_SWAP);
                setBarColor(j + 1, COLOR_SWAP);
                await sleep(getDelay());

                // Swap
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                setBarHeight(j, array[j]);
                setBarHeight(j + 1, array[j + 1]);
                await sleep(getDelay());
            }

            setBarColor(j, COLOR_DEFAULT);
            setBarColor(j + 1, COLOR_DEFAULT);
        }
        setBarColor(n - i - 1, COLOR_SORTED);
    }
    setBarColor(0, COLOR_SORTED);
}

// 2. Merge Sort
async function mergeSort(left, right) {
    if (left >= right) return;

    const mid = Math.floor(left + (right - left) / 2);

    await mergeSort(left, mid);
    await mergeSort(mid + 1, right);
    await merge(left, mid, right);
}

async function merge(left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) {
        L[i] = array[left + i];
        setBarColor(left + i, COLOR_COMPARE);
    }
    for (let j = 0; j < n2; j++) {
        R[j] = array[mid + 1 + j];
        setBarColor(mid + 1 + j, COLOR_COMPARE);
    }
    await sleep(getDelay());

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            array[k] = L[i];
            setBarHeight(k, array[k]);
            setBarColor(k, COLOR_SWAP);
            i++;
        } else {
            array[k] = R[j];
            setBarHeight(k, array[k]);
            setBarColor(k, COLOR_SWAP);
            j++;
        }
        await sleep(getDelay());
        setBarColor(k, COLOR_DEFAULT);
        k++;
    }

    while (i < n1) {
        array[k] = L[i];
        setBarHeight(k, array[k]);
        setBarColor(k, COLOR_SWAP);
        await sleep(getDelay());
        setBarColor(k, COLOR_DEFAULT);
        i++;
        k++;
    }

    while (j < n2) {
        array[k] = R[j];
        setBarHeight(k, array[k]);
        setBarColor(k, COLOR_SWAP);
        await sleep(getDelay());
        setBarColor(k, COLOR_DEFAULT);
        j++;
        k++;
    }
}

// 3. Quick Sort
async function quickSort(low, high) {
    if (low < high) {
        const pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    } else if (low === high) {
        // Base case single element is sorted (color logic handled at end)
    }
}

async function partition(low, high) {
    const pivot = array[high];
    setBarColor(high, COLOR_SWAP); // Pivot color
    await sleep(getDelay());

    let i = low - 1;

    for (let j = low; j < high; j++) {
        setBarColor(j, COLOR_COMPARE);
        await sleep(getDelay());

        if (array[j] < pivot) {
            i++;
            // Swap array[i] and array[j]
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;

            setBarHeight(i, array[i]);
            setBarHeight(j, array[j]);

            setBarColor(i, COLOR_SWAP);
            setBarColor(j, COLOR_SWAP);
            await sleep(getDelay());

            setBarColor(i, COLOR_DEFAULT);
        }
        setBarColor(j, COLOR_DEFAULT);
    }

    // Swap array[i+1] and array[high] (pivot)
    let temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;

    setBarHeight(i + 1, array[i + 1]);
    setBarHeight(high, array[high]);

    setBarColor(i + 1, COLOR_SWAP);
    setBarColor(high, COLOR_SWAP);
    await sleep(getDelay());

    setBarColor(high, COLOR_DEFAULT);
    setBarColor(i + 1, COLOR_DEFAULT);

    return i + 1;
}

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', init);
