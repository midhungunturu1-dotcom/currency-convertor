import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Main {
    public static void main(String[] args) {
        Properties properties = loadProperties();
        String baseUrl = properties.getProperty("api.base.url", "https://api.frankfurter.app");

        Currency usd = new Currency("USD", "US Dollar", "$" );
        Currency inr = new Currency("INR", "Indian Rupee", "₹" );

        System.out.println("Currency Converter Demo");
        System.out.println(usd);
        System.out.println(inr);

        ExchangeRateService exchangeRateService = new ExchangeRateService(baseUrl);
        CurrencyConverter converter = new CurrencyConverter(exchangeRateService);

        try {
            double convertedAmount = converter.convertCurrency(100.0, "USD", "INR");
            System.out.printf("100 USD = %.2f INR%n", convertedAmount);
        } catch (IOException | InterruptedException exception) {
            System.out.println("Unable to fetch exchange rates: " + exception.getMessage());
        }
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();
        try (InputStream inputStream = Main.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (inputStream != null) {
                properties.load(inputStream);
            }
        } catch (IOException exception) {
            System.out.println("Fallback to default configuration: " + exception.getMessage());
        }
        return properties;
    }
}
