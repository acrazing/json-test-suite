package json_test_suite_test

import (
	"testing"
	"fmt"
	"."
)

func TestFmt(t *testing.T) {
	fmt.Printf("[%6s]\n", "he")
	fmt.Printf("%%%d.\n", 1 + 5)
	fmt.Printf(fmt.Sprintf("%%%dd.\n", 1 + 5), 2)
}

func TestCompareUnmarshal(t *testing.T) {
	json_test_suite.CompareUnmarshal(map[string]func([]byte) (interface{}, error){
		"Hello": func(data []byte) (interface{}, error) {
			return nil, nil
		},
		"World": func(data []byte) (interface{}, error) {
			return nil, nil
		},
	}, "./correct")
}