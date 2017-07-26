package json_test_suite

import (
	"log"
	"io/ioutil"
	"strings"
	"path"
	"fmt"
	"time"
	"strconv"
	"sort"
)

func assert(reason string, err interface{}) {
	if err != nil {
		log.Fatal(reason, err)
	}
}

func max(x int, y int) int {
	if x > y {
		return x
	}
	return y
}

func min(x int64, y int64) int64 {
	if x < y {
		return x
	}
	return y
}

type by [][]string

func (a by) Len() int {
	return len(a)
}
func (a by) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}
func (a by) Less(i, j int) bool {
	return strings.Compare(a[i][0], a[j][0]) < 0
}

func CompareUnmarshal(actors map[string]func(data []byte) (interface{}, error), testSuiteDir string) {
	okFiles, err := ioutil.ReadDir(testSuiteDir)
	assert("read dir", err)
	okCases := map[string][]byte{}
	for _, file := range okFiles {
		if strings.HasPrefix(file.Name(), ".") || strings.HasPrefix(file.Name(), "all") {
			continue
		}
		okCases[strings.TrimRight(file.Name(), ".json")], err = ioutil.ReadFile(path.Join(testSuiteDir, file.Name()))
		assert("read case: " + file.Name(), err)
	}
	columnWidth := make([]int, len(actors) + 1)
	outTable := make([][]string, len(okCases) + 1)
	rowIndex := 0
	columnIndex := 0
	var row []string
	row = make([]string, len(actors) + 1)
	row[columnIndex] = "case"
	columnWidth[columnIndex] = len(row[columnIndex]) + 5
	columnIndex++
	for name := range actors {
		row[columnIndex] = name
		columnWidth[columnIndex] = len(row[columnIndex]) + 5
		columnIndex++
	}
	outTable[rowIndex] = row
	rowIndex++
	var start time.Time
	var testCount int
	var i int
	var rowMin int64
	var rowTimes = make([]int64, len(actors) + 1)
	for name, input := range okCases {
		row = make([]string, len(actors) + 1)
		columnIndex = 0
		switch  {
		case len(input) > 1 << 26: // 64Mb
			testCount = 1
		case len(input) > 1 << 24: // 16Mb
			testCount = 5
		case len(input) > 1 << 20: // 1Mb
			testCount = 10
		case len(input) > 1 << 17: // 128Kb
			testCount = 50
		case len(input) > 1 << 10: // 1Kb
			testCount = 100
		default:
			testCount = 10000
		}
		row[columnIndex] = fmt.Sprintf("%s(%db/%d)", name, len(input), testCount)
		columnWidth[columnIndex] = max(columnWidth[columnIndex], len(row[columnIndex]) + 5)
		columnIndex++
		rowMin = 1 << 60
		for k, actor := range actors {
			start = time.Now()
			for i = 0; i < testCount; i++ {
				_, err = actor(input)
				assert(name + " " + k, err)
			}
			rowTimes[columnIndex] = time.Now().Sub(start).Nanoseconds() / int64(testCount)
			rowMin = min(rowMin, rowTimes[columnIndex])
			row[columnIndex] = strconv.FormatInt(rowMin, 10)
			columnIndex++
		}
		columnIndex = 1
		for _ = range actors {
			row[columnIndex] = strconv.FormatFloat(float64(rowTimes[columnIndex]) / float64(rowMin), 'G', 3, 64)
			columnWidth[columnIndex] = max(columnWidth[columnIndex], len(row[columnIndex]) + 5)
			columnIndex++
		}
		outTable[rowIndex] = row
		rowIndex++
	}
	log.Print(columnWidth)
	indexWidth := len(strconv.Itoa(len(outTable)))
	sort.Sort(by(outTable[1:]))
	for i, r := range outTable {
		fmt.Printf(fmt.Sprintf("%%%dd.", indexWidth), i)
		for j, c := range r {
			fmt.Printf(fmt.Sprintf("%%%ds", columnWidth[j]), c)
		}
		fmt.Print("\n")
	}
}