import java.io.IOException;

public class CurrencyConverter {
    private final ExchangeRateService exchangeRateService;
    private String validationMessage;

    public CurrencyConverter(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    public double convertCurrency(double amount, String baseCurrency, String targetCurrency) throws IOException, InterruptedException {
        if (!validateInput(amount, baseCurrency, targetCurrency)) {
            throw new IllegalArgumentException(validationMessage);
        }

        exchangeRateService.fetchLatestRates(baseCurrency);
        double exchangeRate = exchangeRateService.getExchangeRate(baseCurrency, targetCurrency);
        return calculateConvertedAmount(amount, exchangeRate);
    }

    public boolean validateInput(double amount, String baseCurrency, String targetCurrency) {
        if (Double.isNaN(amount) || Double.isInfinite(amount) || amount <= 0) {
            validationMessage = "Amount must be greater than zero.";
            return false;
        }

        if (baseCurrency == null || baseCurrency.isBlank()) {
            validationMessage = "Base currency is required.";
            return false;
        }

        if (targetCurrency == null || targetCurrency.isBlank()) {
            validationMessage = "Target currency is required.";
            return false;
        }

        if (baseCurrency.equalsIgnoreCase(targetCurrency)) {
            validationMessage = "Please select different currencies.";
            return false;
        }

        validationMessage = "Validation passed.";
        return true;
    }

    public double calculateConvertedAmount(double amount, double exchangeRate) {
        return amount * exchangeRate;
    }

    public String getValidationMessage() {
        return validationMessage;
    }
}
