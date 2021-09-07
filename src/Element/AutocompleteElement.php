<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\Exception;

final class AutocompleteElement extends AbstractElement
{
    private string $route;
    private string $queryParam;
    private string $dataType;
    private string $mode;

    public function setRoute(string $route): self
    {
        $this->route = $route;

        return $this;
    }

    public function setQueryParam(string $queryParam): self
    {
        $this->queryParam = $queryParam;

        return $this;
    }

    public function setDataType(string $dataType): self
    {
        if (!\in_array($dataType, static::DATA_TYPES, true)) {
            throw new Exception(\sprintf('invalid data type "%s"', $dataType));
        }

        $this->dataType = $dataType;

        return $this;
    }

    public function setMode(string $mode): self
    {
        if (!\in_array($mode, static::MODES, true)) {
            throw new Exception(\sprintf('invalid mode "%s"', $mode));
        }

        $this->mode = $mode;

        return $this;
    }

    public function render($values): array
    {
        if (null !== $values) {
            $values = (array)$values;
        }

        return $this->renderBase() + [
            'route' => $this->route,
            'queryParam' => $this->queryParam,
            'values' => $values,
            'dataType' => $this->dataType,
            'mode' => $this->mode,
        ];
    }

    protected function getType(): string
    {
        return 'autocomplete';
    }
}
