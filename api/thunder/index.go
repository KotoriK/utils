package thunder

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"regexp"
)

type Result struct {
	Ok   bool   `json:"ok"`
	Data string `json:"data"`
}

func ThunderHandler(w http.ResponseWriter, req *http.Request) {
	ok := false
	var result string
	query := req.URL.Query()
	q := query.Get("q")
	if len(q) == 0 {
		result = "empty 'q'"
		printResult(w, ok, result)
		return
	}
	reg, _ := regexp.Compile(`thunder:\/\/([A-z0-9+\/]+==)`)
	regResult := reg.FindStringSubmatch(q)
	if len(regResult) > 1 {
		byteResult, err := base64.StdEncoding.DecodeString(regResult[1])
		if err != nil {
			result = err.Error()
			printResult(w, ok, result)
			return
		}
		ok = true
		result = string(byteResult[2 : len(byteResult)-2])
	} else {
		result = "illegal thunder link"
	}

	printResult(w, ok, result)
}
func printResult(w http.ResponseWriter, ok bool, result string) {
	json.NewEncoder(w).Encode(Result{
		Ok:   ok,
		Data: result,
	})
}
