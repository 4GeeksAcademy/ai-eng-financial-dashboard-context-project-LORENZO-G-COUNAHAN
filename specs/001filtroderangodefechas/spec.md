# Filtro de rango de fechas

## Objetivo
Permitir al equipo de finanzas centrarse en un periodo concreto y consultar los datos financieros correspondientes sin mostrar todo el histórico a la vez.

## Usuario
Persona que consulta el dashboard financiero.

## Historia de usuario
Como usuario del equipo de finanzas, quiero elegir una fecha de inicio y una fecha de fin para que el dashboard muestre los datos del periodo que me interesa.

## Requisitos funcionales
- En la parte superior del dashboard, el sistema presenta dos campos de fecha: uno para la fecha de inicio y otro para la fecha de fin.
- Ambos campos son opcionales. Si están vacíos, el dashboard muestra todos los datos disponibles.
- El sistema filtra todos los datos que se muestran actualmente en la página según las fechas indicadas, incluyendo los movimientos de las fechas de inicio y fin.
- El sistema envía las fechas seleccionadas a la API en formato `YYYY-MM-DD`.
- Cerca de los campos, el sistema muestra la fecha más antigua y la más reciente disponibles en el dataset, para que el usuario conozca el rango disponible.
- El sistema actualiza los indicadores y gráficos para representar los datos del periodo seleccionado.
- Si la fecha de fin es anterior a la fecha de inicio, el sistema informa al usuario que el rango no es válido.

## Criterios de aceptación
- En la parte superior del dashboard se muestran campos identificados como fecha de inicio y fecha de fin.
- Con ambas fechas seleccionadas, todos los datos actualmente mostrados en el dashboard corresponden únicamente al rango elegido.
- Un movimiento cuya fecha coincide con cualquiera de los límites seleccionados aparece en los resultados.
- Si solo se indica fecha de inicio, se muestran los datos desde esa fecha en adelante; si solo se indica fecha de fin, se muestran los datos hasta esa fecha.
- Las fechas seleccionadas se envían a la API con formato `YYYY-MM-DD`.
- Cerca de los campos se presenta la fecha más antigua y la más reciente disponibles en el dataset.
- Si ambos campos están vacíos, se muestran todos los datos disponibles.
- Si la fecha de fin precede a la de inicio, el sistema informa que el rango no es válido.
- Si el rango seleccionado no contiene datos, el dashboard comunica que no hay datos para mostrar.

## Casos de prueba
- Comprobar que los dos campos de fecha aparecen en la parte superior del dashboard.
- Seleccionar inicio y fin y comprobar que todos los datos mostrados corresponden al rango, incluidos movimientos fechados exactamente en los límites.
- Indicar solo una fecha de inicio y comprobar que se muestran los datos desde esa fecha.
- Indicar solo una fecha de fin y comprobar que se muestran los datos hasta esa fecha.
- Comprobar que las fechas seleccionadas se envían a la API como `YYYY-MM-DD`.
- Comprobar que junto a los campos se muestran la fecha más antigua y la más reciente disponibles.
- Dejar ambos campos vacíos y comprobar que se muestran todos los datos disponibles.
- Indicar un rango invertido y comprobar que aparece el aviso de rango no válido.
- Seleccionar un rango sin datos y comprobar que se informa que no hay datos para mostrar.

## Fuera de alcance
- Filtrar por categoría, tipo de operación o tipo de negocio.
- Comparar el periodo seleccionado con otros periodos.
- Modificar la generación o el almacenamiento de los datos financieros.
