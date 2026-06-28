import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExchangeRateService {
    private final String baseUrl;
    private final Map<String, Double> exchangeRates;

    public ExchangeRateService(String baseUrl) {
        this.baseUrl = baseUrl;
        this.exchangeRates = new LinkedHashMap<>();
    }

    public Map<String, Double> fetchLatestRates() throws IOException, InterruptedException {
        return fetchLatestRates("USD");
    }

    public Map<String, Double> fetchLatestRates(String baseCurrency) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/latest?from=" + baseCurrency.toUpperCase()))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException("Failed to fetch exchange rates. Status: " + response.statusCode());
        }

        exchangeRates.clear();
        Pattern pattern = Pattern.compile("\"([A-Z]{3})\":([0-9]+(?:\\.[0-9]+)?)");
        Matcher matcher = pattern.matcher(response.body());

        while (matcher.find()) {
            exchangeRates.put(matcher.group(1), Double.parseDouble(matcher.group(2)));
        }

        return new LinkedHashMap<>(exchangeRates);
    }

    public double getExchangeRate(String baseCurrency, String targetCurrency) {
        if (baseCurrency == null || targetCurrency == null) {
            throw new IllegalArgumentException("Currencies cannot be null.");
        }
        if (baseCurrency.equalsIgnoreCase(targetCurrency)) {
            return 1.0;
        }
        return exchangeRates.getOrDefault(targetCurrency.toUpperCase(), 1.0);
    }
}
